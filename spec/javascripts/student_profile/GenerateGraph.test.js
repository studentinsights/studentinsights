import generateReportGraph from '../../../app/assets/javascripts/student_profile/pdf/GenerateReportGraph';

describe('generateReportGraph', () => {
  it('generates graph without crashing', () => {
    generateReportGraph("#graph", "Attendence Details", {}, "Graph", []);
  });
});
