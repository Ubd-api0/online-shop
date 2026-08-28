import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Layout from "../components/Layout/Layout";
import Loader from "../components/Layout/Loader";
import styles from "../styles/styles";

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);
  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={`${styles.section} py-8`}>
          <h1 className="text-2xl font-semibold text-content mb-6">Events</h1>
          {allEvents && allEvents.length !== 0 ? (
            <div className="space-y-6">
              {allEvents.map((event) => (
                <EventCard key={event._id} active={true} data={event} />
              ))}
            </div>
          ) : (
            <p className="text-center w-full py-24 text-lg text-muted">
              No events available.
            </p>
          )}
        </div>
      )}
    </Layout>
  );
};

export default EventsPage;
