import React from 'react';
import fetchMock from 'fetch-mock';
import {storiesOf} from '@storybook/react';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {withDefaultNowContext} from '../testing/NowContainer';
import {pageSizeFrame} from '../testing/storybookFrames';
import SchoolAbsencesPage from './SchoolAbsencesPage';
import absencesJson from './absencesJson.fixture.js';

function storyProps(props = {}) {
  return {
    schoolIdOrSlug: 'hea',
    disableStylingForTest: true,
    ...props
  };
}

function mockFetch() {
  fetchMock.restore();
  fetchMock.get('/api/schools/hea/absences/data', absencesJson);
}

storiesOf('school_absences/SchoolAbsencesPage', module) // eslint-disable-line no-undef
  .add('all', () => {
    mockFetch();
    return withDefaultNowContext(
      <PerDistrictContainer districtKey="demo">
        {pageSizeFrame(<SchoolAbsencesPage {...storyProps()} />)}
      </PerDistrictContainer>
    );
  });
