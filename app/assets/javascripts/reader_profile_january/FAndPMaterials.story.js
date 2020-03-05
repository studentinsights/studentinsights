import React from 'react';
import {storiesOf} from '@storybook/react';
import FAndPMaterials, {UnrolledForTest} from './FAndPMaterials';


function renderLevel(rawLevelText) {
  return <div style={styles.container}><FAndPMaterials rawLevelText={rawLevelText} /></div>;
}

console.log('remove unrolled');
storiesOf('reader_profile_january/FAndPMaterials', module) // eslint-disable-line no-undef
  .add('unrolled', () => <UnrolledForTest levelStyle={styles.container} />)
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
      {renderLevel("K")}
      {renderLevel("L")}
      {renderLevel("M")}
      {renderLevel("N")}
      {renderLevel("O")}
      {renderLevel("P")}
      {renderLevel("Q")}
      {renderLevel("R")}
      {renderLevel("S")}
      {renderLevel("T")}
      {renderLevel("U")}
      {renderLevel("V")}
      {renderLevel("W")}
      {renderLevel("X")}
      {renderLevel("Y")}
      {renderLevel("Z")}
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