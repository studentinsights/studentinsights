require 'rails_helper'

RSpec.describe FileImporterOptions do

  describe '#all_importer_keys' do
    it 'requires writing the keys written out again test to verify they are correct' do
      expect(FileImporterOptions.new.all_importer_keys).to contain_exactly(*[
        'x2',
        'star',
        'students',
        'assessments',
        'behavior',
        'educators',
        'attendance',
        'courses_sections',
        'student_section_assignments',
        'student_section_grades',
        'educator_section_assignments',
        'star_math',
        'star_reading',
        '504',
        'ed_plan'
      ])
    end
  end
  describe '#prioritized_file_importer_classes' do

    context 'when provided with the default sources' do
      let(:importer_keys) { ['x2', 'star'] }

      it 'returns X2 and STAR importers in order' do
        expect(FileImporterOptions.new.prioritized_file_importer_classes(importer_keys)).to match_array([
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
      let(:importer_keys) { ['x2'] }

      it 'returns x2 importers, no star importers' do
        expect(FileImporterOptions.new.prioritized_file_importer_classes(importer_keys)).to match_array([
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
      let(:importer_keys) { ['star'] }

      it 'returns star importers' do
        expect(FileImporterOptions.new.prioritized_file_importer_classes(importer_keys)).to match_array([
          StarMathImporter,
          StarReadingImporter,
        ])
      end
    end

    context 'when provided with invalid sources' do
      let(:importer_keys) { ['x3'] }

      it 'raises' do
        expect { FileImporterOptions.new.prioritized_file_importer_classes(importer_keys) }.to raise_error(KeyError)
      end
    end

    context 'when provided unprioritized importers' do
      let(:importer_keys) {
        [
          'students',
          'student_section_assignments',
          'educators',
          'courses_sections',
        ]
      }

      it 'puts them in the correct order' do
        expect(FileImporterOptions.new.prioritized_file_importer_classes(importer_keys)).to eq([
          EducatorsImporter,
          CoursesSectionsImporter,
          StudentsImporter,
          StudentSectionAssignmentsImporter
        ])
      end
    end
  end
end
