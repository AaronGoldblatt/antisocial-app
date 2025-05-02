"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { countNewFollowingPosts } from "@/actions/posts";

interface NotificationBadgeProps {
  pathname: string;
}

export function NotificationBadge({ pathname }: NotificationBadgeProps) {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize state on client side only
  useEffect(() => {
    setIsClient(true);
    
    // Try to get the last checked time from local storage
    const storedTime = localStorage.getItem("lastNotificationCheck");
    setLastCheckedTime(storedTime ? new Date(storedTime) : new Date());
  }, []);

  // Check for new posts only after lastCheckedTime is initialized
  useEffect(() => {
    // Skip if we're not on the client yet or lastCheckedTime isn't set
    if (!isClient || !lastCheckedTime) return;
    
    const checkForNewPosts = async () => {
      try {
        // Count new posts since the last check
        const count = await countNewFollowingPosts(lastCheckedTime);
        setNewPostsCount(count);
      } catch (error) {
        console.error("Failed to check for new posts:", error);
      }
    };

    // Check for new posts immediately
    checkForNewPosts();
    
    // Set up interval to check for new posts every minute
    const intervalId = setInterval(checkForNewPosts, 60000);
    
    return () => clearInterval(intervalId);
  }, [isClient, lastCheckedTime]);
  
  // When navigating to the notifications page, reset the counter
  useEffect(() => {
    // Skip if we're not on the client yet
    if (!isClient) return;
    
    if (pathname === "/notifications") {
      setNewPostsCount(0);
      const now = new Date();
      setLastCheckedTime(now);
      localStorage.setItem("lastNotificationCheck", now.toISOString());
    }
  }, [pathname, isClient]);

  return (
    <Link
      href="/notifications"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
        pathname === "/notifications" && "bg-muted"
      )}
    >
      <div className="relative">
        <Bell className="h-5 w-5" />
        {newPostsCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {newPostsCount > 99 ? "99+" : newPostsCount}
          </span>
        )}
      </div>
      <span className="sr-only">Annoyances</span>
    </Link>
  );
} 