// Let users know that we changed a page design recently
export default function DesignChangesBanner() {
  return (
    <div style={styles.banner}>
      <span>We made some design changes here this week!</span>
      <span style={{ marginLeft: 10 }}>Please let us know what you think.</span>
    </div>
  );
}

const styles = {
  banner: {
    background: '#4a9de2',
    color: 'white',
    fontWeight: 'bold',
    padding: 20
  }
};
