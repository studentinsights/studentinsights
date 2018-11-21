import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {readEnv} from '../envForJs';
import PerDistrictContainer from '../components/PerDistrictContainer';
import parseQueryString from './parseQueryString';
import PageContainer from './PageContainer';


export default function renderStudentMain(el) {
  // entry point, reading static bootstrapped data from the page
  const serializedData = $('#serialized-data').data();
  const {districtKey} = readEnv();

  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <PageContainer
        shouldUseLightProfilePage={false}
        districtKey={districtKey}
        nowMomentFn={() => moment.utc()}
        serializedData={serializedData}
        queryParams={parseQueryString(window.location.search)}
        history={window.history} />
    </PerDistrictContainer>
  , el);
}
