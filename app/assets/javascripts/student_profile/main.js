import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {readEnv} from '../envForJs';
import MixpanelUtils from '../helpers/MixpanelUtils';
import PerDistrictContainer from '../components/PerDistrictContainer';
import parseQueryString from './parseQueryString';
import PageContainer from './PageContainer';


export default function renderStudentMain(el) {
  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  MixpanelUtils.registerUser(serializedData.currentEducator);
  MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });
  const {districtKey} = readEnv();

  const shouldUseLightProfilePage = (window.location.pathname.slice(-3) === '/v3');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <PageContainer
        shouldUseLightProfilePage={shouldUseLightProfilePage}
        districtKey={districtKey}
        nowMomentFn={() => moment.utc()}
        serializedData={serializedData}
        queryParams={parseQueryString(window.location.search)}
        history={window.history} />
    </PerDistrictContainer>
  , el);
}
