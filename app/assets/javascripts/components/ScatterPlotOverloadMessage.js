import React from 'react';

export default function ScatterPlotOverloadMessage() {
  return (
    <div style={styles.message}>
      <span>There are too many students to display this data. You can select another chart type or try filtering the students.</span>
    </div>
  );
}

const styles = {
  message: {
    padding: 20
  }
};