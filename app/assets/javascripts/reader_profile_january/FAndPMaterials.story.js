import React from 'react';
import {storiesOf} from '@storybook/react';
import FAndPMaterials from './FAndPMaterials';


function renderLevel(rawLevelText) {
  return <div style={styles.container}><FAndPMaterials rawLevelText={rawLevelText} /></div>;
}

storiesOf('reader_profile_january/FAndPMaterials', module) // eslint-disable-line no-undef
  .add('default', () => (
    <div>
      {renderLevel("A")}
      {renderLevel("B")}
      {renderLevel("C")}
      {renderLevel("D")}
      {renderLevel("E")}
      {renderLevel("F")}
      {renderLevel("G")}
      {renderLevel("H")}
      {renderLevel("I")}
      {renderLevel("J")}
      {renderLevel("k")}
    </div>
  ));

const styles = {
  container: {
    display: 'inline-block',
    padding: 10,
    height: 150,
    width: 200
  }
};