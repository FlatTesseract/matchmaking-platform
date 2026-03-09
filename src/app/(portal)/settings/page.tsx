"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Lock,
  Smartphone,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

type SettingsSection = "account" | "notifications" | "privacy" | "billing";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    newMatches: true,
    introductions: true,
    messages: true,
    reminders: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    showLastActive: true,
    allowProfileViews: true,
  });

  const email = user?.email || "—";
  const phone = user?.user_metadata?.phone || profile?.basic_info?.phone || "—";

  const sections = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
  ];

  const handleSaveNotificationPrefs = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_preferences: notifications }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacyPrefs = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy_settings: privacy }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Privacy settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D1318] mb-2">Settings</h1>
        <p className="text-[#6B5B5E]">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    activeSection === section.id
                      ? "bg-[#7B1E3A] text-white"
                      : "text-[#6B5B5E] hover:bg-[#F5E0E8]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-[#6B5B5E] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>

        <div className="flex-1">
          {activeSection === "account" && (
            <SettingsCard title="Account Settings" description="Manage your account details">
              <div className="space-y-6">
                <SettingRow icon={Mail} label="Email Address" value={email} action="Change" />
                <SettingRow icon={Phone} label="Phone Number" value={phone} action="Change" />
                <SettingRow icon={Lock} label="Password" value="••••••••••••" action="Change" />
                <SettingRow icon={Smartphone} label="Two-Factor Authentication" value="Not enabled" action="Enable" />

                <hr className="border-[#F5E0E8]" />

                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                  </h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 rounded-lg">
                    Delete Account
                  </Button>
                </div>
              </div>
            </SettingsCard>
          )}

          {activeSection === "notifications" && (
            <SettingsCard title="Notification Settings" description="Control how we contact you">
              <div className="space-y-4">
                <ToggleSetting
                  label="New Matches"
                  description="Get notified when you receive new matches"
                  enabled={notifications.newMatches}
                  onChange={(v) => setNotifications({ ...notifications, newMatches: v })}
                />
                <ToggleSetting
                  label="Introduction Updates"
                  description="Get notified about introduction status changes"
                  enabled={notifications.introductions}
                  onChange={(v) => setNotifications({ ...notifications, introductions: v })}
                />
                <ToggleSetting
                  label="New Messages"
                  description="Get notified when you receive messages from your matchmaker"
                  enabled={notifications.messages}
                  onChange={(v) => setNotifications({ ...notifications, messages: v })}
                />
                <ToggleSetting
                  label="Reminders"
                  description="Get reminders about upcoming meetings and deadlines"
                  enabled={notifications.reminders}
                  onChange={(v) => setNotifications({ ...notifications, reminders: v })}
                />
                <hr className="border-[#F5E0E8]" />
                <ToggleSetting
                  label="Marketing Emails"
                  description="Receive tips, updates, and promotional content"
                  enabled={notifications.marketing}
                  onChange={(v) => setNotifications({ ...notifications, marketing: v })}
                />
                <Button onClick={handleSaveNotificationPrefs} disabled={saving} className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-lg">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </SettingsCard>
          )}

          {activeSection === "privacy" && (
            <SettingsCard title="Privacy Settings" description="Control your privacy preferences">
              <div className="space-y-4">
                <ToggleSetting
                  label="Show Online Status"
                  description="Let others see when you're online"
                  enabled={privacy.showOnlineStatus}
                  onChange={(v) => setPrivacy({ ...privacy, showOnlineStatus: v })}
                />
                <ToggleSetting
                  label="Show Last Active"
                  description="Let others see when you were last active"
                  enabled={privacy.showLastActive}
                  onChange={(v) => setPrivacy({ ...privacy, showLastActive: v })}
                />
                <ToggleSetting
                  label="Allow Profile Views"
                  description="Allow the matchmaker to share your profile with potential matches"
                  enabled={privacy.allowProfileViews}
                  onChange={(v) => setPrivacy({ ...privacy, allowProfileViews: v })}
                />

                <hr className="border-[#F5E0E8]" />

                <div className="p-4 bg-[#FFF8F0] rounded-xl">
                  <h4 className="font-semibold text-[#2D1318] mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C9956B]" />
                    Your Data
                  </h4>
                  <p className="text-sm text-[#6B5B5E] mb-4">
                    You can request a copy of your data or ask us to delete it at any time.
                  </p>
                  <Button variant="outline" className="border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#F5E0E8] rounded-lg">
                    Download My Data
                  </Button>
                </div>

                <Button onClick={handleSavePrivacyPrefs} disabled={saving} className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white rounded-lg">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            </SettingsCard>
          )}

          {activeSection === "billing" && (
            <SettingsCard title="Billing & Subscription" description="Manage your subscription and payments">
              <div className="space-y-6">
                <div className="p-4 bg-[#F5E0E8] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#2D1318]">Current Plan</span>
                    <span className="text-xs font-semibold text-[#7B1E3A] bg-white px-2 py-1 rounded-full">
                      {profile?.payment_type === "premium" ? "Premium" : "Basic"}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B5B5E]">
                    {profile?.payment_type === "premium"
                      ? "You're on the Premium plan with priority matching."
                      : "You're on the Basic plan. Upgrade to Premium for more features."}
                  </p>
                </div>

                {profile?.payment_type !== "premium" && (
                  <div className="bg-gradient-to-r from-[#C9956B] to-[#E3C4A8] rounded-xl p-5 text-white">
                    <h4 className="font-semibold text-lg mb-2">Upgrade to Premium</h4>
                    <ul className="text-sm space-y-1 mb-4 text-white/90">
                      <li>• Priority matching</li>
                      <li>• See who viewed your profile</li>
                      <li>• Unlimited messages</li>
                      <li>• Dedicated matchmaker support</li>
                    </ul>
                    <Button className="bg-white text-[#C9956B] hover:bg-white/90 rounded-lg">
                      Upgrade Now - ৳10,000
                    </Button>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-[#2D1318] mb-3">Payment History</h4>
                  <div className="bg-white rounded-xl border border-[#FECDD3]/50 overflow-hidden">
                    {profile?.payment_status === "paid" ? (
                      <div className="p-4 flex items-center justify-between border-b border-[#F5E0E8]">
                        <div>
                          <p className="font-medium text-[#2D1318]">
                            {profile.payment_type === "premium" ? "Premium Plan" : "Signup Fee"}
                          </p>
                          <p className="text-xs text-[#6B5B5E]">Paid</p>
                        </div>
                        <span className="text-[#2D1318] font-semibold">
                          ৳{profile.payment_type === "premium" ? "10,000" : "2,000"}
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-[#6B5B5E]">No payments yet</div>
                    )}
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#FECDD3]/50 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-[#2D1318]">{title}</h2>
        <p className="text-sm text-[#6B5B5E]">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, action }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; action: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F5E0E8] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#7B1E3A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2D1318]">{label}</p>
        <p className="text-sm text-[#6B5B5E] truncate">{value}</p>
      </div>
      <Button variant="outline" size="sm" className="border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#F5E0E8] rounded-lg">
        {action}
      </Button>
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-[#FFF8F0] rounded-xl">
      <div className="flex-1">
        <p className="font-medium text-[#2D1318]">{label}</p>
        <p className="text-sm text-[#6B5B5E]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors flex-shrink-0",
          enabled ? "bg-[#7B1E3A]" : "bg-[#E3C4A8]"
        )}
      >
        <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", enabled ? "translate-x-7" : "translate-x-1")} />
      </button>
    </div>
  );
}
