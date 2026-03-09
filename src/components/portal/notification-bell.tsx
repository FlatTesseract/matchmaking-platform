"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bell, Heart, MessageCircle, CheckCircle, Info, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const typeIcons: Record<string, typeof Heart> = {
  match: Heart,
  introduction: CheckCircle,
  message: MessageCircle,
  system: Info,
};

export function NotificationBell({ className }: { className?: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 8);

  const handleNotificationClick = async (notification: {
    id: string;
    is_read: boolean;
  }) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6B5B5E] hover:text-[#7B1E3A] hover:bg-[#F5E0E8] rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#7B1E3A] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#FECDD3]/50 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-[#F5E0E8]">
            <h3 className="font-semibold text-[#2D1318] font-serif">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-[#7B1E3A] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-[#E3C4A8] mx-auto mb-2" />
                <p className="text-sm text-[#6B5B5E]">No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map(
                (notification: {
                  id: string;
                  type: string;
                  title: string;
                  message: string;
                  is_read: boolean;
                  link: string | null;
                  created_at: string;
                }) => {
                  const Icon = typeIcons[notification.type] || Info;
                  const content = (
                    <div
                      className={cn(
                        "flex gap-3 p-3 hover:bg-[#FFF8F0] transition-colors cursor-pointer",
                        !notification.is_read && "bg-[#F5E0E8]/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          notification.is_read ? "bg-[#F5E0E8]" : "bg-[#7B1E3A]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            notification.is_read ? "text-[#7B1E3A]" : "text-white"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm",
                            notification.is_read
                              ? "text-[#6B5B5E]"
                              : "font-semibold text-[#2D1318]"
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-[#6B5B5E] truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#C9956B] mt-0.5">
                          {new Date(notification.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#7B1E3A] mt-2 flex-shrink-0" />
                      )}
                    </div>
                  );

                  if (notification.link) {
                    return (
                      <Link key={notification.id} href={notification.link}>
                        {content}
                      </Link>
                    );
                  }
                  return <div key={notification.id}>{content}</div>;
                }
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
