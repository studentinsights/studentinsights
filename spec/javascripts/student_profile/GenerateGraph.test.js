import generateGraph from '../../../app/assets/javascripts/student_profile/pdf/GenerateGraph';

describe('generateGraph', () => {
  it('generates graph without crashing', () => {
    const result = generateGraph("#graph", "Attendence Details", {}, "Graph", []);
  });
});
