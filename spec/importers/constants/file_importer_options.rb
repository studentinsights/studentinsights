require 'rails_helper'

RSpec.describe FileImporterOptions do

  describe '#importer_descriptions' do

    # This is literally just typing this twice, as an extra check on making changes here safely.
    it 'fails a test when a change is made without updating tests' do
      expect(FileImporterOptions.importer_descriptions).to eq([
        ImporterDescription.new(110, 'EducatorsImporter', EducatorsImporter, :x2),
        ImporterDescription.new(200, 'CoursesSectionsImporter', CoursesSectionsImporter, :x2),
        ImporterDescription.new(210, 'EducatorSectionAssignmentsImporter', EducatorSectionAssignmentsImporter, :x2),
        ImporterDescription.new(220, 'StudentsImporter', StudentsImporter, :x2),
        ImporterDescription.new(230, 'StudentSectionAssignmentsImporter', StudentSectionAssignmentsImporter, :x2),
        ImporterDescription.new(310, 'BehaviorImporter', BehaviorImporter, :x2),
        ImporterDescription.new(320, 'AttendanceImporter', AttendanceImporter, :x2),
        ImporterDescription.new(330, 'StudentSectionGradesImporter', StudentSectionGradesImporter, :x2),
        ImporterDescription.new(340, 'X2AssessmentImporter', X2AssessmentImporter, :x2),
        ImporterDescription.new(400, 'StarMathImporter', StarMathImporter, :star),
        ImporterDescription.new(410, 'StarReadingImporter', StarReadingImporter, :star)
      ])
    end
  end
end
