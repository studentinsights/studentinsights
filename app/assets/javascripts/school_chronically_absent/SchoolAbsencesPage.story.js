import React from 'react';
import fetchMock from 'fetch-mock';
import {storiesOf} from '@storybook/react';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {withNowContext} from '../testing/NowContainer';
import {pageSizeFrame} from '../testing/storybookFrames';
import SchoolAbsencesPage from './SchoolAbsencesPage';
import absencesJson from './absencesJson.fixture.js';

function storyProps(props = {}) {
  return {
    schoolIdOrSlug: 'shs',
    disableStylingForTest: true,
    ...props
  };
}

function mockFetch() {
  fetchMock.restore();
  fetchMock.get('express:/api/schools/:school_id/absences/data', absencesJson);
}

storiesOf('school_absences/SchoolAbsencesPage', module) // eslint-disable-line no-undef
  .add('all', () => {
    mockFetch();
    return withNowContext('2018-09-22T17:03:06.123Z',
      <PerDistrictContainer districtKey="demo">
        {pageSizeFrame(<SchoolAbsencesPage {...storyProps()} />)}
      </PerDistrictContainer>
    );
  });
