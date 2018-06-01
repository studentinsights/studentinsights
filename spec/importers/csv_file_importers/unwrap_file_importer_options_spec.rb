require 'rails_helper'

RSpec.describe UnwrapFileImporterOptions do

  describe '#sort_file_import_classes' do

    context 'when provided with the default sources' do
      let(:source) { ['x2', 'star'] }
      let(:unwrapper) { described_class.new(source) }

      it 'returns X2 and STAR importers in order' do
        expect(unwrapper.sort_file_import_classes).to match_array([
          EducatorsImporter,
          CoursesSectionsImporter,
          EducatorSectionAssignmentsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter,
          AttendanceImporter,
          BehaviorImporter,
          StudentSectionGradesImporter,
          StarMathImporter,
          StarReadingImporter,
          X2AssessmentImporter,
        ])
      end
    end

    context 'when provided x2' do
      let(:source) { ['x2'] }
      let(:unwrapper) { described_class.new(source) }

      it 'returns x2 importers, no star importers' do
        expect(unwrapper.sort_file_import_classes).to match_array([
          EducatorsImporter,
          CoursesSectionsImporter,
          EducatorSectionAssignmentsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter,
          AttendanceImporter,
          BehaviorImporter,
          StudentSectionGradesImporter,
          X2AssessmentImporter,
        ])
      end
    end

    context 'when provided star' do
      let(:source) { ['star'] }
      let(:unwrapper) { described_class.new(source) }

      it 'returns star importers' do
        expect(unwrapper.sort_file_import_classes).to match_array([
          StarMathImporter,
          StarReadingImporter,
        ])
      end
    end

    context 'when provided with invalid sources' do
      let(:source) { ['x3'] }
      let(:unwrapper) { described_class.new(source) }

      it 'returns an empty array' do
        expect(unwrapper.sort_file_import_classes).to match_array([])
      end
    end

    context 'when provided unprioritized importers' do
      let(:source) {
        [
          'students',
          'student_section_assignments',
          'educators',
          'courses_sections',
        ]
      }

      let(:unwrapper) { described_class.new(source) }

      it 'puts them in the correct order' do
        expect(unwrapper.sort_file_import_classes).to eq([
          EducatorsImporter,
          CoursesSectionsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter
        ])
      end
    end

  end

end
