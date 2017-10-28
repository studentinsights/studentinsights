export default function restrictedNotesMain(el) {
  const RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer;

  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  window.ReactDOM.render(<RestrictedNotesPageContainer serializedData={serializedData} nowMomentFn={moment.utc} />, el);
}
