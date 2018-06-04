import ReactDOM from 'react-dom';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';

export default function restrictedNotesMain(el) {
  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  ReactDOM.render(<RestrictedNotesPageContainer serializedData={serializedData} nowMomentFn={moment.utc} />, el);
}
