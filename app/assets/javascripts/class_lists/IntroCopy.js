import React from 'react';

const text = `Over the last few years, we've been hearing from teachers and principals and how complex and time-consuming the class assignment process is, including the moving of sticky notes, looking up information and lists of tally marks.

When Student Insights was being developed, some teachers started asking whether we could use it to make the class list creation process easier and more efficient.`;


export default function IntroCopy() {
  const videoUrl = 'https://drive.google.com/file/d/1OmsB-9K1cgo1g6l21rnu0xL8H4KDyVAk/view';
  const onePageGuideUrl = 'https://drive.google.com/file/d/1NHztne6tGz16qbIIeoeL8aNvTLQ0UTHj/view';
  return (
    <div style={styles.introCopy}>
      {text}
      <div style={{marginTop: 20}}>This <a href={videoUrl} target="_blank">Video Walkthrough</a> and a <a href={onePageGuideUrl} target="_blank">Quick Guide</a> show the steps to use this tool.</div>
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