import React from 'react';
import PropTypes from 'prop-types';
import {interpretFAndPEnglish} from '../reading/fAndPInterpreter';
import MaterialsCarousel from './MaterialsCarousel';


export default function FAndPMaterials({rawLevelText}) {
  const level = interpretFAndPEnglish(rawLevelText);
  if (!level) return null;
  const fileKeys = MATERIAL_URLS[level];
  if (!fileKeys) return null;

  return (
    <div>
      <MaterialsCarousel fileKeys={fileKeys} />
      <div style={styles.level}>Instructional level: {level}</div>
    </div>
  );
}
FAndPMaterials.propTypes = {
  rawLevelText: PropTypes.string.isRequired
};

const styles = {
  level: {
    paddingLeft: 5,
    fontSize: 12
  }
};


const MATERIAL_URLS = {
  'A': ['FP-A1-cover', 'FP-A1-page', 'FP-A2-cover', 'FP-A2-page'],
  'B': ['FP-B1-cover', 'FP-B1-page', 'FP-B2-cover', 'FP-B2-page']
};
