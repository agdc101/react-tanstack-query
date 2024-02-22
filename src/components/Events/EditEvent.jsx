import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { updateEvent, fetchEvent, queryClient } from '../../util/http.js';


export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({signal, id}),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches for this event. to make sure we don't fetch old data
      queryClient.cancelQueries(['events', id]);

      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData(['events', id]);

      // Optimistically update the cache with the new event
      queryClient.setQueryData(['events', id], newData.event);

      // Return a context object with the previous event
      return { previousEvent };
    },
    onError: (error, newData, context) => {
      // Rollback to the previous value
      queryClient.setQueryData(['events', id], context.previousEvent);
    },
    onSettled: () => {
      // Invalidate and refetch to make sure we have the latest data
      queryClient.invalidateQueries(['events', id]);
    },
  });

  function handleClose() {
    navigate('../');
  }

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate('../');
  }

  let content;

  if (isPending) {
    content = <div className='center'><LoadingIndicator/></div>;
  }

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
