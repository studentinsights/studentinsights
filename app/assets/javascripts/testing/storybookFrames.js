import React from 'react';

// For simulating page size, including height
export function pageSizeFrame(children) {
  return (
    <div style={{width: '100%', background: '#333'}}>
      <div style={{width: 1024, border: '5px solid #333', background: 'white', height: 768}}>
      {children}
      </div>
    </div>
  );
}

// For simulating page size
export function widthFrame(children) {
  return (
    <div style={{width: '100%', background: '#eee'}}>
      <div style={{width: 1024, background: 'white', border: '1px solid #eee'}}>
      {children}
      </div>
    </div>
  );
}