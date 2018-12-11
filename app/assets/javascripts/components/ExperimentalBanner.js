import React from 'react';
import {Email} from './PublicLinks';


// Pure UI showing that the feature is experimental
export default function ExperimentalBanner() {
  return (
    <div style={styles.banner}>
      <span>This is an experimental prototype!</span>
      <span style={{ marginLeft: 10 }}>Please share your feedback with <Email style={{fontWeight: 'bold'}} />.</span>
    </div>
  );
}


const styles = {
  banner: {
    background: 'red',
    color: 'white',
    fontWeight: 'bold',
    padding: 20
  }
};
