// Pure UI showing that the feature is experimental
export default function ExperimentalBanner() {
  return (
    <div style={styles.banner}>
      <span>This is an experimental prototype page!</span>
      <span style={{ marginLeft: 10 }}>Please try it out and share your feedback.</span>
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
