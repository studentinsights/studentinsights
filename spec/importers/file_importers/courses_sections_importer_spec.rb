require 'rails_helper'

RSpec.describe CoursesSectionsImporter do

  describe '#import' do
    def create_importer_with_mocked_file_text(file_text, options = {})
      log = LogHelper::FakeLog.new
      importer = CoursesSectionsImporter.new(options: {
        school_scope: nil,
        log: log
      }.merge(options))
      csv = StreamingCsvTransformer.from_text(log, file_text, {
        csv_options: { header_converters: :symbol }
      })
      allow(importer).to receive(:download_csv).and_return(csv)
      [importer, log]
    end

    it 'works on the happy path end-to-end' do
      school = FactoryBot.create(:shs)
      importer, log = create_importer_with_mocked_file_text([
        '"course_number","course_description","school_local_id","section_number","term_local_id","section_schedule","section_room_number","district_school_year"',
        '"ART-205","Handmade Ceramics I","SHS","ART-205B","FY","3(M-R)","232B","2018"'
      ].join("\n"))
      importer.import

      expect(School.all.size).to eq(1)
      expect(Course.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "course_number"=>"ART-205",
        "course_description"=>"Handmade Ceramics I",
        "school_id"=>school.id
      }])
      expect(Section.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "section_number"=>"ART-205B",
        "term_local_id"=>"FY",
        "schedule"=>"3(M-R)",
        "room_number"=>"232B",
        "course_id"=>Course.first.id,
        "district_school_year"=>2018
      }])
      expect(log.output).to include 'courses_syncer#stats'
      expect(log.output).to include 'courses_syncer#stats'
      expect(log.output).to include ':created_rows_count=>1'
    end

    it 'only updates on subsequent runs' do
      FactoryBot.create(:shs)

      # first run
      first_importer, first_log = create_importer_with_mocked_file_text([
        '"course_number","course_description","school_local_id","section_number","term_local_id","section_schedule","section_room_number","district_school_year"',
        '"ART-205","Handmade Ceramics I","SHS","ART-205B","FY","3(M-R)","232B","2018"'
      ].join("\n"))
      first_importer.import
      expect(first_log.output).to include ':created_rows_count=>1'
      expect(Course.all.size).to eq(1)
      expect(Section.all.size).to eq(1)

      # second run, with different name and room
      second_importer, second_log = create_importer_with_mocked_file_text([
        '"course_number","course_description","school_local_id","section_number","term_local_id","section_schedule","section_room_number","district_school_year"',
        '"ART-205","Handmade Ceramic-Making I","SHS","ART-205B","FY","3(M-R)","229B","2018"'
      ].join("\n"))
      second_importer.import
      expect(Course.all.size).to eq(1)
      expect(Course.first.course_description).to eq("Handmade Ceramic-Making I")
      expect(Section.first.room_number).to eq('229B')
      expect(second_log.output).to include ':updated_rows_count=>1'
    end
  end

  describe '#import_row' do
    let(:courses_sections_importer) {
      described_class.new(options: {
        school_scope: nil,
        log: LogHelper::Redirect.instance.file
      })
    }

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
        puts 'before'
        puts row.class
        puts row.to_json
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
      it 'creates Course but does not create Section, and tracks stat' do
        courses_sections_importer.send(:import_row, {
          course_number:'ART-205',
          course_description:'Handmade Ceramics I',
          section_number:'ART-205B',
          school_local_id: 'SHS',
          term_local_id:'',
          section_schedule:'3(M-R)',
          section_room_number:'232B'
        })
        expect(Course.count).to eq(1)
        expect(Section.count).to eq(0)
        expect(courses_sections_importer.instance_variable_get(:@invalid_course_school_count)).to eq(0)
      end
    end
  end
end
