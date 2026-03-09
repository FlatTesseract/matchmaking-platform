-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'seeker' check (role in ('seeker', 'family', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own record" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own record" on public.users
  for update using (auth.uid() = id);

create policy "Admins can read all users" on public.users
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_by text not null default 'self' check (created_by in ('self', 'parent', 'sibling', 'other')),
  status text not null default 'draft' check (status in ('draft', 'pending_payment', 'pending_verification', 'verified', 'active', 'inactive', 'suspended')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  basic_info jsonb default '{}',
  education_career jsonb default '{}',
  family_background jsonb default '{}',
  values_beliefs jsonb default '{}',
  lifestyle jsonb default '{}',
  personality jsonb default '{}',
  partner_preferences jsonb default '{}',
  photos text[] default '{}',
  verification_documents text[] default '{}',
  matchmaker_notes text,
  compatibility_vector vector(384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Admins can read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all profiles" on public.profiles
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_status on public.profiles(status);
create index idx_profiles_verification_status on public.profiles(verification_status);
create index idx_profiles_created_at on public.profiles(created_at desc);

-- ============================================================
-- MATCHES TABLE
-- ============================================================
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_1_id uuid not null references public.profiles(id) on delete cascade,
  profile_2_id uuid not null references public.profiles(id) on delete cascade,
  compatibility_score float not null default 0,
  compatibility_breakdown jsonb default '{}',
  status text not null default 'suggested' check (status in ('suggested', 'approved', 'sent', 'viewed', 'interested_1', 'interested_2', 'mutual', 'declined_1', 'declined_2')),
  matchmaker_notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_different_profiles check (profile_1_id != profile_2_id)
);

alter table public.matches enable row level security;

-- Users can see matches where their profile is involved and match has been sent
create policy "Users can read own matches" on public.matches
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id in (profile_1_id, profile_2_id)
        and profiles.user_id = auth.uid()
    )
    and status not in ('suggested', 'approved')
  );

-- Users can update matches (express interest/pass)
create policy "Users can update own matches" on public.matches
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id in (profile_1_id, profile_2_id)
        and profiles.user_id = auth.uid()
    )
    and status not in ('suggested', 'approved')
  );

create policy "Admins can do all on matches" on public.matches
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_matches_profile_1 on public.matches(profile_1_id);
create index idx_matches_profile_2 on public.matches(profile_2_id);
create index idx_matches_status on public.matches(status);
create index idx_matches_score on public.matches(compatibility_score desc);

-- ============================================================
-- INTRODUCTIONS TABLE
-- ============================================================
create table public.introductions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  initiated_by uuid not null references public.users(id),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted_1', 'accepted_2', 'confirmed', 'declined', 'contact_shared', 'completed', 'expired')),
  preferred_contact_1 jsonb,
  preferred_contact_2 jsonb,
  response_deadline timestamptz,
  outcome jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.introductions enable row level security;

create policy "Users can read own introductions" on public.introductions
  for select using (
    exists (
      select 1 from public.matches m
      join public.profiles p on p.id in (m.profile_1_id, m.profile_2_id)
      where m.id = match_id and p.user_id = auth.uid()
    )
  );

create policy "Users can update own introductions" on public.introductions
  for update using (
    exists (
      select 1 from public.matches m
      join public.profiles p on p.id in (m.profile_1_id, m.profile_2_id)
      where m.id = match_id and p.user_id = auth.uid()
    )
  );

create policy "Admins can do all on introductions" on public.introductions
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_introductions_match_id on public.introductions(match_id);
create index idx_introductions_status on public.introductions(status);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  type text not null default 'user_matchmaker' check (type in ('user_matchmaker', 'admin_internal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can read own conversations" on public.conversations
  for select using (auth.uid() = any(participant_ids));

create policy "Admins can do all on conversations" on public.conversations
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Index
create index idx_conversations_participants on public.conversations using gin(participant_ids);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  content text not null,
  attachments jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can read messages in own conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations
      where id = conversation_id and auth.uid() = any(participant_ids)
    )
  );

create policy "Users can insert messages in own conversations" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where id = conversation_id and auth.uid() = any(participant_ids)
    )
  );

create policy "Admins can do all on messages" on public.messages
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_messages_conversation on public.messages(conversation_id, created_at desc);
create index idx_messages_sender on public.messages(sender_id);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  profile_id uuid references public.profiles(id),
  amount decimal(12, 2) not null,
  currency text not null default 'BDT',
  type text not null check (type in ('signup', 'premium', 'success_fee')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text,
  provider_reference text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can read own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "Admins can do all on payments" on public.payments
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_payments_user_id on public.payments(user_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_created_at on public.payments(created_at desc);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Admins can insert notifications" on public.notifications
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Indexes
create index idx_notifications_user_id on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where read_at is null;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', true),
  ('verification-documents', 'verification-documents', false);

-- Storage policies for profile photos
create policy "Users can upload own photos" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view profile photos" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "Users can delete own photos" on storage.objects
  for delete using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for verification documents
create policy "Users can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own documents" on storage.objects
  for select using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can view all documents" on storage.objects
  for select using (
    bucket_id = 'verification-documents'
    and exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger matches_updated_at
  before update on public.matches
  for each row execute function public.handle_updated_at();

create trigger introductions_updated_at
  before update on public.introductions
  for each row execute function public.handle_updated_at();

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TRIGGER: Auto-create user record on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'seeker'),
    new.phone
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
