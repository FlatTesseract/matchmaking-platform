import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected portal routes - require authentication
  const portalRoutes = [
    "/dashboard",
    "/matches",
    "/introductions",
    "/messages",
    "/profile",
    "/settings",
    "/create-profile",
  ];
  const isPortalRoute = portalRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Admin routes - require authentication + admin role
  const isAdminRoute = pathname.startsWith("/admin");

  if (!user && (isPortalRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAdminRoute) {
    // Check admin role from user metadata
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (!profile || profile.status === "draft") {
      url.pathname = "/create-profile";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Redirect users with incomplete profiles to onboarding
  if (user && pathname === "/dashboard") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.status === "draft") {
      const url = request.nextUrl.clone();
      url.pathname = "/create-profile";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
