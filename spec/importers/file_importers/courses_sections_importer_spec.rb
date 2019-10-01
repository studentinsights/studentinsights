require 'rails_helper'

RSpec.describe CoursesSectionsImporter do

  let(:log) { LogHelper::Redirect.instance.file }

  let(:courses_sections_importer) {
    described_class.new(options: {
      school_scope: nil, log: log
    })
  }

  describe '#import_row' do
    let!(:school) { FactoryBot.create(:shs) }

    context 'happy path' do
      let(:row) do
        {
          course_number:'ART-205',
          course_description:'Handmade Ceramics I',
          section_number:'ART-205B',
          school_local_id: 'SHS',
          term_local_id:'FY',
          section_schedule:'3(M-R)',
          section_room_number:'232B'
        }
      end

      before do
        courses_sections_importer.send(:import_row, row)
      end

      it 'creates a course' do
        expect(Course.count).to eq(1)
      end

      it 'creates a section' do
        expect(Section.count).to eq(1)
      end

      it 'creates a section of the course' do
        expect(Section.first.course).to eq(Course.first)
      end
    end

    context 'missing school_local_id' do
      let(:row) do
        {
          course_number:'ART-205',
          course_description:'Handmade Ceramics I',
          section_number:'ART-205B',
          term_local_id:'FY',
          section_schedule:'3(M-R)',
          section_room_number:'232B'
        }
      end

      before do
        courses_sections_importer.send(:import_row, row)
      end

      it 'does not create a course' do
        expect(Course.count).to eq(0)
      end

      it 'does not create a section' do
        expect(Section.count).to eq(0)
      end
    end

    context 'when section with invalid blank term_local_id' do
      let(:row) do
        {
          course_number:'ART-205',
          course_description:'Handmade Ceramics I',
          section_number:'ART-205B',
          school_local_id: 'SHS',
          term_local_id:'',
          section_schedule:'3(M-R)',
          section_room_number:'232B'
        }
      end

      it 'creates Course but does not create Section, and tracks invalid count' do
        courses_sections_importer.send(:import_row, row)
        expect(Course.count).to eq(1)
        expect(Section.count).to eq(0)
        expect(courses_sections_importer.instance_variable_get(:@invalid_course_school_count)).to eq(0)
        expect(courses_sections_importer.instance_variable_get(:@invalid_course_count)).to eq(0)
        expect(courses_sections_importer.instance_variable_get(:@invalid_section_count)).to eq(1)
      end
    end
  end
end
