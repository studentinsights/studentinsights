// For simulating page size
export default function storybookFrame(children) {
  return (
    <div style={{width: '100%', background: '#333'}}>
      <div style={{height: 216}} />
      <div style={{width: 1024, border: '5px solid #333', background: 'white'}}>
      {children}
      </div>
    </div>
  );
}