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
  'A': ['FP-A1-page', 'FP-A2-page'],
  'B': ['FP-B1-page', 'FP-B2-page'],
  'C': ['FP-C1-page', 'FP-C2-page'],
  'D': ['FP-D1-page', 'FP-D2-page'],
  'E': ['FP-E1-page', 'FP-E2-page'],
  'F': ['FP-F1-page', 'FP-F2-page'],
  'G': ['FP-G1-page', 'FP-G2-page'],
  'H': ['FP-H1-page', 'FP-H2-page'],
  'I': ['FP-I1-page', 'FP-I2-page'],
  'J': ['FP-J1-page', 'FP-J2-page'],
  'K': ['FP-K1-page', 'FP-K2-page'],
  'L': ['FP-L1-page', 'FP-L2-page', 'FP-L3-page', 'FP-L4-page'],
  'M': ['FP-M1-page', 'FP-M2-page', 'FP-M3-page', 'FP-M4-page', 'FP-M5-page'],
  'N': ['FP-N1-page', 'FP-N2-page', 'FP-N3-page', 'FP-N4-page']
};
