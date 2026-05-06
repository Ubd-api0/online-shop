import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/styles';
import EventCard from './EventCard';

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  return (
    <div className={`${styles.section} py-6`}>
      <h2 className='text-xl font-semibold mb-4'>Popular Events</h2>

      <div className='bg-white border rounded-md p-3'>
        {allEvents?.length > 0 ? (
          <EventCard data={allEvents[0]} />
        ) : (
          <p className='text-gray-500 text-sm'>No Events available</p>
        )}
      </div>
    </div>
  );
};

export default Events;
