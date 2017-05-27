const ReactDOM = window.ReactDOM;
const HomeroomTable = window.shared.HomeroomTable;

$(function() {
  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {

    // entry point, reading static bootstrapped data from the page
    const serializedData = $('#serialized-data').data();

    ReactDOM.render(
      <HomeroomTable
        showStar={serializedData.showStar}
        showMcas={serializedData.showMcas}
        rows={serializedData.rows}
      />,
      document.getElementById('homeroom-table')
    );

  }
});
