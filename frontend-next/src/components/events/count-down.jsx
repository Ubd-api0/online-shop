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
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(data));

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = calculateTimeLeft(data);
      setTimeLeft(next);
      if (
        typeof next.days === "undefined" &&
        typeof next.hours === "undefined" &&
        typeof next.minutes === "undefined" &&
        typeof next.seconds === "undefined"
      ) {
        // Best-effort cleanup once the event ends — only the seller is
        // authorized, so this silently no-ops for everyone else (matches
        // the original app's fire-and-forget behavior).
        api.delete(`/event/delete-shop-event/${data._id}`).catch(() => {});
      }
    }, 1000);
    return () => clearTimeout(timer);
  });

  const entries = Object.entries(timeLeft).filter(([, v]) => v);

  return (
    <div>
      {entries.length ? (
        entries.map(([interval, value]) => (
          <span key={interval} className="text-[25px] text-brand">
            {value} {interval}{" "}
          </span>
        ))
      ) : (
        <span className="text-[25px] text-red-500">Time&apos;s Up</span>
      )}
    </div>
  );
}
