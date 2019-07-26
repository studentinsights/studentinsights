# typed: false
require 'rails_helper'

RSpec.describe FileImporterOptions do

  describe '#all_data_flows' do
    it 'references :importer classes that implement #import' do
      data_flows = FileImporterOptions.new.all_data_flows
      importer_classes = data_flows.flat_map(&:importer).map(&:constantize)
      importer_classes.each do |importer_class|
        expect(importer_class.instance_methods(false)).to include(:import)
      end
    end

    it 'references ApplicationRecord classes with :touches' do
      model_class_names = ApplicationRecord.descendants.map(&:name)
      touches = FileImporterOptions.new.all_data_flows.flat_map(&:touches)
      expect { touches.map(&:constantize) }.not_to raise_error
      expect(touches - model_class_names).to eq []
    end

    it 'can describe data flows for all importer classes' do
      data_flows = FileImporterOptions.new.all_data_flows
      expect(data_flows.size).to eq(13)
      sorted_json = data_flows.as_json.sort_by {|j| j['importer'] }
      fixture_json = JSON.parse(IO.read("#{Rails.root}/spec/importers/helpers/data_flows_fixture.json"))
      expect(sorted_json).to eq(fixture_json)
    end
  end

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
        'ed_plans',
        'ed_plan_accommodations',
        '504'
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
          EdPlansImporter,
          EdPlanAccommodationsImporter
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
          EdPlansImporter,
          EdPlanAccommodationsImporter
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
