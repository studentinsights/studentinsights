import React from 'react';
import {storiesOf} from '@storybook/react';
import FAndPMaterials from './FAndPMaterials';


storiesOf('reader_profile_january/FAndPMaterials', module) // eslint-disable-line no-undef
  .add('default', () => (
    <div>
      <div style={styles.container}><FAndPMaterials rawLevelText="A" /></div>
      <div style={styles.container}><FAndPMaterials rawLevelText="B" /></div>
      <div style={styles.container}><FAndPMaterials rawLevelText="C" /></div>
      <div style={styles.container}><FAndPMaterials rawLevelText="D" /></div>
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