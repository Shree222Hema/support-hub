"use client";

import { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";

export function ActivityPulse() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/tickets", { // Using existing tickets API which has some logs or we can use a dedicated one
           headers: { Authorization: `Bearer ${token}` }
        });
        // For now, if we don't have a dedicated Activity API, we'll mock some pulses based on tickets
        // Actually, let's create a small internal fetch for ActivityLog
        const logRes = await fetch("/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
        if (logRes.ok) {
           const data = await logRes.json();
           setActivities(data.recentTickets || []);
        }
      } catch (error) {
        console.error("Activity pulse error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Activity Pulse
        </h3>
        <Activity className="h-4 w-4 text-muted-foreground opacity-50" />
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        ) : activities.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Syncing live updates...</p>
        ) : (
          activities.map((activity, idx) => (
            <div key={activity.id} className="flex gap-3 relative pb-4 last:pb-0">
              {idx !== activities.length - 1 && (
                <div className="absolute left-1.5 top-2 h-full w-px bg-muted" />
              )}
              <div className="h-3 w-3 rounded-full bg-primary mt-1 z-10 shrink-0 ring-4 ring-background" />
              <div className="space-y-1">
                <p className="text-xs font-semibold leading-none">
                  Ticket Created: {activity.title}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2 w-2" />
                  {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {activity.creator?.name || 'Admin'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
