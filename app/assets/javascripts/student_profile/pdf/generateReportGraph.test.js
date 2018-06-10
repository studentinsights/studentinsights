import generateReportGraph from './generateReportGraph';

describe('generateReportGraph', () => {
  it('generates graph without crashing', () => {
    generateReportGraph("#graph", "Attendence Details", {}, "Graph", []);
  });
});
