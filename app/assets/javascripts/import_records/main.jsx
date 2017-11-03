import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import ImportRecordsPage from './import_records_page.jsx';

$(function() {
  if ($('body').hasClass('import_records') && $('body').hasClass('index')) {
    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'IMPORT_RECORDS' });

    window.ReactDOM.render(<ImportRecordsPage 
          importRecords={serializedData.importRecords}/>, document.getElementById('main'));
  }
});