import React from 'react';

// Pure UI showing that the feature is experimental
export default function ExperimentalBanner() {
  return (
    <div style={styles.banner}>
      <span>This is an experimental prototype!</span>
      <span style={{ marginLeft: 10 }}>Please share your feedback with <a style={{fontWeight: 'bold'}} href="mailto:ideas@studentinsights.org">hello@studentinsights.org</a>.</span>
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
