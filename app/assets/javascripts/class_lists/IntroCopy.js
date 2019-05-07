import React from 'react';

const text = `Over the last few years, we've been hearing from teachers and principals and how complex and time-consuming the class assignment process is, including the moving of sticky notes, looking up information and lists of tally marks.

When Student Insights was being developed, some teachers started asking whether we could use it to make the class list creation process easier and more efficient.`;


export default function IntroCopy() {
  const videoUrl = 'https://drive.google.com/file/d/1Xm7idNsxyry2agV9-cZoRkutF0dvAEAA/view';
  const onePageGuideUrl = 'https://drive.google.com/file/d/1mXbSjrL010JUwONQ-Dj-3GvzxDuAXCjo/view';
  return (
    <div style={styles.introCopy}>
      {text}
      <div style={{marginTop: 20}}>This <a href={videoUrl} target="_blank" rel="noopener noreferrer">Video Walkthrough</a> and a <a href={onePageGuideUrl} target="_blank" rel="noopener noreferrer">Quick Guide</a> show the steps to use this tool.</div>
    </div>
  );
}

const styles = {
  introCopy: {
    fontSize: 14,
    padding: 10,
    paddingLeft: 0,
    whiteSpace: 'pre-wrap'
  }
};