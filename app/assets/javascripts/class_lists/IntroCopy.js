const text = `Over the last few years, I’ve been hearing from teachers and principals about how complex and time-consuming the class assignment process is.  It’s so hard to juggle and keep track of all the various factors, like gender, ELL status, disabilities, academics, and discipline.  And in a diverse city as ours, we want as much as possible for the classrooms at each grade level to reflect the diversity of your school community.    In the past year, people who have seen our Student Insights system have asked if there might be a way to use technology to make the process a little more streamlined.

With our new grant from the Boston Foundation to expand the functionality of Insights, we are happy to announce that we have created a tool for you to use.   Over the past few months, we have talked to a bunch of teachers and principals to see what would help, prototyped different models, and piloted this tool with several teams to get feedback.

-Uri`;

export default function IntroCopy() {
  return (
    <div style={styles.introCopy}>
      {text}
    </div>
  );
}

const styles = {
  introCopy: {
    padding: 10,
    paddingLeft: 5,
    whiteSpace: 'pre-wrap'
  }
};