"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

function calculateTimeLeft(data) {
  const difference = +new Date(data.Finish_Date) - +new Date();
  let timeLeft = {};
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
}

export function CountDown({ data }) {
  // null until mounted: "now" differs between server render and the browser.
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const next = calculateTimeLeft(data);
      setTimeLeft(next);
      return next;
    };
    tick();
    const timer = setInterval(() => {
      const next = tick();
      if (typeof next.days === "undefined") {
        clearInterval(timer);
        // Best-effort cleanup once the event ends — only the seller is
        // authorized, so this silently no-ops for everyone else (matches
        // the original app's fire-and-forget behavior).
        api.delete(`/event/delete-shop-event/${data._id}`).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data]);

  if (!timeLeft) return <div className="h-[52px]" aria-hidden />;

  if (typeof timeLeft.days === "undefined") {
    return <span className="text-lg font-semibold text-danger">Deal ended</span>;
  }

  const parts = [
    ["days", timeLeft.days],
    ["hrs", timeLeft.hours],
    ["min", timeLeft.minutes],
    ["sec", timeLeft.seconds],
  ];

  return (
    <div className="flex items-center gap-2" role="timer" aria-label="Time left in this deal">
      <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted">Ends in</span>
      {parts.map(([label, value]) => (
        <div key={label} className="flex min-w-[44px] flex-col items-center rounded-DEFAULT bg-brand px-2 py-1 text-white">
          <span className="text-lg font-bold leading-tight tabular-nums">{String(value).padStart(2, "0")}</span>
          <span className="text-[10px] uppercase leading-none opacity-85">{label}</span>
        </div>
      ))}
    </div>
  );
}
