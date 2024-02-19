import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent } from '../../util/http.js';
import { queryClient } from '../../util/http.js';

import Header from '../Header.jsx';

export default function EventDetails() {

  //get id from the url
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: ({ signal }) => fetchEvent({id, signal})
  });

  const { mutate } = useMutation({
    mutationFn: ({ signal }) => deleteEvent({id}),
    onSuccess: (data) => {
      console.log('Mutation succeeded with result:', data);
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      navigate('../');
    }
  });

  const handleDelete = () => {
    console.log('delete');
    mutate();
  }

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error: {isError.message}</p>;
  }

  // console.log(data);

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
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.date + ' @ ' + data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    </>
  );
}
