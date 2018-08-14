import React from 'react';

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