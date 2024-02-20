import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';

import ErrorBlock from '../UI/ErrorBlock.jsx';
import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';

export default function EventDetails() {

  //get id from the url
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({id, signal})
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('../');
    }
  });

  const handleDelete = () => {
    mutate({id}); // params can be passed to the mutation function!
  }

  if (isPending) {
    return <LoadingIndicator/>;
  }

  if (isError) {
    return <ErrorBlock title="error occurred" message={error.info?.message || 'Failed to get event' } />;
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDelete} >Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    </>
  );
}
