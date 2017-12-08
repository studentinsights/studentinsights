import RestrictedNotesPageContainer from './RestrictedNotesPageContainer'

export default function restrictedNotesMain(el) {
  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  window.ReactDOM.render(<RestrictedNotesPageContainer serializedData={serializedData} nowMomentFn={moment.utc} />, el);
}
