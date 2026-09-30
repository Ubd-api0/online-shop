import { listAllEvents } from "@/lib/data/events";
import { serialize } from "@/lib/serialize";
import { EventCard } from "@/components/events/event-card";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const allEvents = serialize(await listAllEvents());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 800px:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold text-content">Events</h1>
      {allEvents.length !== 0 ? (
        <div className="space-y-6">
          {allEvents.map((event) => (
            <EventCard key={event._id} data={event} />
          ))}
        </div>
      ) : (
        <p className="w-full py-24 text-center text-lg text-muted">No events available.</p>
      )}
    </div>
  );
}
