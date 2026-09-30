import { EventCard } from "@/components/events/event-card";

export function EventsWidget({ allEvents = [] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 800px:px-6 800px:py-8">
      <h2 className="mb-4 font-display text-xl font-semibold text-content">Popular Events</h2>
      {allEvents.length > 0 ? (
        <EventCard data={allEvents[0]} />
      ) : (
        <p className="text-sm text-muted">No Events available</p>
      )}
    </div>
  );
}
