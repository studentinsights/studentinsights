import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import FAndPMaterials, {MATERIAL_URLS} from './FAndPMaterials';
import MaterialsCarousel from './MaterialsCarousel';


export function UnrolledForTest({levelStyle = {}}) {
  return (
    <div>
      {Object.keys(MATERIAL_URLS).map(level => {
        const fileKeys = MATERIAL_URLS[level];
        if (!fileKeys) return null;
        return (
          <div key={level} style={levelStyle}>
            <h2>{level}</h2>
            {fileKeys.map(fileKey => <MaterialsCarousel key={fileKey} fileKeys={[fileKey]} />)}
          </div>
        );
      })}
    </div>
  );
}
UnrolledForTest.propTypes = {
  levelStyle: PropTypes.object
};

export function testRender(props = {}) {
  return <FAndPMaterials {...props} />;
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<FAndPMaterials rawLevelText="A" />, el);
});


it('snapshots', () => {
  const tree = renderer.create(<FAndPMaterials rawLevelText="A" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots unrolled', () => {
  const tree = renderer.create(<UnrolledForTest />).toJSON();
  expect(tree).toMatchSnapshot();
});
