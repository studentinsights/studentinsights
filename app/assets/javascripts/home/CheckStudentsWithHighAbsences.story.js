import React from 'react';
import {storiesOf} from '@storybook/react';
import {CheckStudentsWithHighAbsencesView} from './CheckStudentsWithHighAbsences';
import {pureTestPropsForN} from './CheckStudentsWithHighAbsences.test';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';

storiesOf('home/CheckStudentsWithHighAbsences', module) // eslint-disable-line no-undef
  .add('different numbers', () => {
    return (
      <div>
        {render(pureTestPropsForN(0))}
        {render(pureTestPropsForN(1))}
        {render(pureTestPropsForN(7))}
      </div>
    );
  });


function render(props) {
  return withDefaultNowContext(
    <div style={{padding: 20}}>
      <div style={{width: 470, border: '5px solid #333'}}>
        <PerDistrictContainer districtKey="somerville">
          <CheckStudentsWithHighAbsencesView {...props} />
        </PerDistrictContainer>
      </div>
    </div>
  );
}