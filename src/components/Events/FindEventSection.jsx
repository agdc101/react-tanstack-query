import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../util/http';
import EventItem from './EventItem';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();

  const { data, isLoading, isError, error } = useQuery({  
    queryKey: ['events', {search: searchTerm}], // queryKey is an array of values that uniquely identifies the query
    queryFn: ({ signal }) => fetchEvents({signal, searchTerm}), // queryFn is a function that returns a promise
    enabled: searchTerm !== undefined, // enabled is a boolean that determines if the query should be executed
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
    content = <LoadingIndicator />; 
  }

  if (isError) {
    content = <ErrorBlock title="error occurred" message={error.info?.message || 'Failed to get events' } />;
  }

  if (data && data.length > 0) {
    content = (
      <ul className="events-list">
        {data.map(event => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
