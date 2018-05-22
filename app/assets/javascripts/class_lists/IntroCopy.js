const text = `Over the last few years, we've been hearing from teachers and principals and how complex and time-consuming the class assignment process is, including the moving of sticky notes, looking up information and lists of tally marks.

When Student Insights was being developed, some teachers started asking whether we could use it to make the class list creation process easier and more efficient.`;


export default function IntroCopy() {
  return (
    <div style={styles.introCopy}>
      {text}
    </div>
  );
}

const styles = {
  introCopy: {
    fontSize: 12,
    padding: 10,
    paddingLeft: 0,
    whiteSpace: 'pre-wrap'
  }
};