import { Link, redirect, useNavigate, useParams, useSubmit, useNavigation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { updateEvent, fetchEvent, queryClient } from '../../util/http.js';


export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const { id } = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({signal, id}),
    staleTime: 10000, // data is considered stale after 10 seconds, this works well with the loader function as it will not refetch data immediately again after.
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (newData) => {
  //     // Cancel any outgoing refetches for this event. to make sure we don't fetch old data
  //     queryClient.cancelQueries(['events', id]);

  //     // Snapshot the previous value
  //     const previousEvent = queryClient.getQueryData(['events', id]);

  //     // Optimistically update the cache with the new event
  //     queryClient.setQueryData(['events', id], newData.event);

  //     // Return a context object with the previous event
  //     return { previousEvent };
  //   },
  //   onError: (error, newData, context) => {
  //     // Rollback to the previous value
  //     queryClient.setQueryData(['events', id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     // Invalidate and refetch to make sure we have the latest data
  //     queryClient.invalidateQueries(['events', id]);
  //   },
  // });

  function handleClose() {
    navigate('../');
  }

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock title="error occurred" message={isError.info?.message || 'Failed to get event' } />
        <div className="form-actions">
          <Link to="../" className="button-text">
            Cancel
          </Link>
        </div>;
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

// data is fetched in the loader function and cached with the query key ['events', id]
// first request made in the component will then be quicker as the data is already cached
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id}),
  });
}

// action function is used to handle form submission
export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });

  queryClient.invalidateQueries(['events', params.id]);

  return redirect('../');
}
