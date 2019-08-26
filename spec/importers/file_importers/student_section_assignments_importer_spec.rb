require 'rails_helper'

RSpec.describe StudentSectionAssignmentsImporter do
  def make_importer(options = {})
    StudentSectionAssignmentsImporter.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    }.merge(options))
  end

  def make_importer_for_import_row_test
    importer = make_importer()
    importer.instance_variable_set(:@school_ids_dictionary, importer.send(:build_school_ids_dictionary))
    importer
  end

  def mock_importer_with_csv(importer, csv)
    allow(importer).to receive(:download_csv).and_return(csv)
    importer
  end

  def fixture_without_years
    filename = "#{Rails.root}/spec/fixtures/student_section_assignment_export_without_district_school_year.txt"
    test_csv_from_file(filename)
  end

  def fixture_for_district_school_year(district_school_year)
    filename = "#{Rails.root}/spec/fixtures/student_section_assignment_export_with_district_school_year_token.txt"
    file = File.read(filename)
    file_with_school_year = file.gsub('<district_school_year>', district_school_year.to_s)

    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new)
    transformer.transform(file_with_school_year)
  end

  def test_csv_from_file(filename)
    file = File.read(filename)
    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new)
    transformer.transform(file)
  end

  def create_students_for_fixture
    FactoryBot.create(:student, local_id: '111')
    FactoryBot.create(:student, local_id: '222')
    FactoryBot.create(:student, local_id: '333')
  end

  def create_courses_and_sections(options = {})
    district_school_year = options.fetch(:district_school_year, nil)
    east = School.find_by_local_id('ESCS')
    high_school = School.find_by_local_id('SHS')

    # db state    
    east_history = FactoryBot.create(:course, course_number: 'SOC6', school: east)
    shs_history = FactoryBot.create(:course, course_number: 'SOC6', school: high_school)
    shs_ela = FactoryBot.create(:course, course_number: 'ELA6', school: high_school)
    shs_math = FactoryBot.create(:course, course_number: 'ALG2', school: high_school)
    east_history_section = FactoryBot.create(:section, course: east_history, section_number: 'SOC6-001', district_school_year: district_school_year)
    shs_history_section = FactoryBot.create(:section, course: shs_history, section_number: 'SOC6-001', district_school_year: district_school_year)
    shs_ela_section = FactoryBot.create(:section, course: shs_ela, section_number: 'ELA6-002', district_school_year: district_school_year)
    shs_math_section = FactoryBot.create(:section, course: shs_math, section_number: 'ALG2-004', district_school_year: district_school_year)

    {
      east_history: east_history,
      shs_history: shs_history,
      shs_ela: shs_ela,
      shs_math: shs_math,
      east_history_section: east_history_section,
      shs_history_section: shs_history_section,
      shs_ela_section: shs_ela_section,
      shs_math_section: shs_math_section
    }
  end

  describe 'integration tests' do
    before { TestPals.seed_somerville_schools_for_test! }

    it 'considers section rows invalid if they are missing district_school_year, even if they would match section records with district_school_year:nil' do
      create_students_for_fixture()
      create_courses_and_sections(district_school_year: nil)

      log = LogHelper::FakeLog.new
      importer = make_importer(log: log)
      mock_importer_with_csv(importer, fixture_without_years)
      importer.import

      expect(log.output).to include '@invalid_student_count: 1'
      expect(log.output).to include '@invalid_course_count: 1'
      expect(log.output).to include '@invalid_section_count: 5'
      expect(log.output).to include ':passed_nil_record_count=>7'
      expect(log.output).to include ':created_rows_count=>0'
      expect(StudentSectionAssignment.count).to eq 0
    end

    it 'imports rows but warns if the district_school_year matches but is older than wall clock' do
      time_now = TestPals.new.time_now
      old_district_school_year = 1 + SchoolYear.to_school_year(time_now - 2.years)
      Timecop.freeze(time_now) do
        create_students_for_fixture()
        create_courses_and_sections(district_school_year: old_district_school_year)

        log = LogHelper::FakeLog.new
        importer = make_importer(log: log)
        mock_importer_with_csv(importer, fixture_for_district_school_year(old_district_school_year))
        importer.import

        expect(log.output).to include '@invalid_student_count: 1'
        expect(log.output).to include '@invalid_course_count: 1'
        expect(log.output).to include '@invalid_section_count: 1'
        expect(log.output).to include '@warning_unexpected_district_school_year_count: 4'
        expect(log.output).to include ':passed_nil_record_count=>3'
        expect(log.output).to include ':created_rows_count=>4'
        expect(StudentSectionAssignment.count).to eq 4
      end
    end

    it 'considers section rows invalid, even if they match on all fields but district_school_year' do
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      create_students_for_fixture()
      create_courses_and_sections(district_school_year: district_school_year - 2)

      Timecop.freeze(time_now) do
        log = LogHelper::FakeLog.new
        importer = make_importer(log: log)
        mock_importer_with_csv(importer, fixture_for_district_school_year(district_school_year))
        importer.import

        expect(log.output).to include '@invalid_student_count: 1'
        expect(log.output).to include '@invalid_course_count: 1'
        expect(log.output).to include '@invalid_section_count: 5'
        expect(log.output).to include ':passed_nil_record_count=>7'
        expect(log.output).to include ':created_rows_count=>0'
        expect(StudentSectionAssignment.count).to eq 0
      end
    end
    
    it 'matches when section rows match district_school_year' do
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      create_students_for_fixture()
      create_courses_and_sections(district_school_year: district_school_year)

      Timecop.freeze(time_now) do
        log = LogHelper::FakeLog.new
        importer = make_importer(log: log)
        mock_importer_with_csv(importer, fixture_for_district_school_year(district_school_year))
        importer.import

        expect(log.output).to include '@invalid_student_count: 1'
        expect(log.output).to include '@invalid_course_count: 1'
        expect(log.output).to include '@invalid_section_count: 1'
        expect(log.output).to include ':passed_nil_record_count=>3'
        expect(log.output).to include ':created_rows_count=>4'
        expect(StudentSectionAssignment.count).to eq 4
      end
    end

    it 'syncs when existing records' do
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      create_students_for_fixture()
      test_records = create_courses_and_sections(district_school_year: district_school_year)

      # will be unchanged
      east_history_section = test_records[:east_history_section]
      StudentSectionAssignment.create!({
        student: Student.find_by_local_id('111'),
        section: east_history_section
      })

      # will be deleted
      shs_math_section = test_records[:shs_math_section]
      StudentSectionAssignment.create!({
        student: Student.find_by_local_id('333'),
        section: shs_math_section
      })
      expect(StudentSectionAssignment.count).to eq 2

      Timecop.freeze(time_now) do
        log = LogHelper::FakeLog.new
        importer = make_importer(log: log)
        mock_importer_with_csv(importer, fixture_for_district_school_year(district_school_year))
        importer.import

        expect(log.output).to include '@invalid_student_count: 1'
        expect(log.output).to include '@invalid_course_count: 1'
        expect(log.output).to include '@invalid_section_count: 1'
        expect(log.output).to include ':passed_nil_record_count=>3'
        expect(log.output).to include ':unchanged_rows_count=>1'
        expect(log.output).to include ':created_rows_count=>3'
        expect(log.output).to include ':destroyed_records_count=>1'
        expect(StudentSectionAssignment.count).to eq 4
      end
    end
  end

  describe '#import_row' do
    def create_test_records_and_test_row(options = {})
      time_now = options.fetch(:time_now, TestPals.new.time_now)
      TestPals.seed_somerville_schools_for_test!

      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      high_school = School.find_by_local_id('SHS')
      course = FactoryBot.create(:course, school: high_school)
      section = FactoryBot.create(:section, course: course, district_school_year: district_school_year)
      student = FactoryBot.create(:student)

      row = {
        local_id: student.local_id,
        course_number: section.course.course_number,
        school_local_id: 'SHS',
        section_number: section.section_number,
        term_local_id: 'FY',
        district_school_year: district_school_year
      }
      [row, student, section]
    end

    it 'creates a student section assignment' do
      row, _, _ = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()
      
      importer.send(:import_row, row)
      expect(StudentSectionAssignment.count).to eq(1)
    end

    it 'assigns the proper student to the proper section' do
      row, student, section = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()

      importer.send(:import_row, row)
      expect(StudentSectionAssignment.first.student).to eq(student)
      expect(StudentSectionAssignment.first.section).to eq(section)
    end

    it 'is invalid if LASID field is missing' do
      row, _, _ = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()
      importer.send(:import_row, row.except(:local_id))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if section_number field is missing' do
      row, _, _ = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()
      importer.send(:import_row, row.except(:section_number))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if LASID reference is not in db' do
      row, _, _ = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()
      importer.send(:import_row, row.merge(local_id: 'DOES NOT EXIST'))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if section_number reference is not in db' do
      row, _, _ = create_test_records_and_test_row()
      importer = make_importer_for_import_row_test()
      importer.send(:import_row, row.merge(section_number: 'DOES NOT EXIST'))
      expect(StudentSectionAssignment.count).to eq(0)
    end
  end

  describe 'deleting rows' do
    before { TestPals.seed_somerville_schools_for_test! }

    def sync_records(importer)
      syncer = importer.instance_variable_get(:@syncer)
      syncer.delete_unmarked_records!(importer.send(:records_within_scope))
      nil
    end

    def make_importer_for_deleting_rows_tests(options = {})
      importer = make_importer(options)
      importer.instance_variable_set(:@school_ids_dictionary, importer.send(:build_school_ids_dictionary))
      importer
    end

    def make_test_row
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      course = FactoryBot.create(:course, school: School.find_by_local_id('SHS'))
      section = FactoryBot.create(:section, course: course, district_school_year: district_school_year)
      student = FactoryBot.create(:student)
      {
        local_id: student.local_id,
        course_number: section.course.course_number,
        school_local_id: section.course.school.local_id,
        section_number: section.section_number,
        term_local_id: section.term_local_id,
        district_school_year: district_school_year
      }
    end
    
    it 'deletes all student section assignments except the recently imported one' do
      # other sections already in db, which should be deleted during test
      FactoryBot.create_list(:student_section_assignment, 20)
      expect(StudentSectionAssignment.all.size).to eq 20

      # new row to import
      row = make_test_row()
      importer = make_importer_for_deleting_rows_tests(school_scope: School.pluck(:local_id))
      log = importer.instance_variable_get(:@log)
      importer.send(:import_row, row)
      expect(StudentSectionAssignment.all.size).to eq 21

      # sync should delete
      sync_records(importer)
      expect(log.output).to include('records_within_import_scope.size: 21 in Insights')
      expect(log.output).to include('@marked_ids.size = 1')
      expect(log.output).to include('records_to_process.size: 20 within scope')
      expect(StudentSectionAssignment.all.size).to eq 1
    end

    it 'respects school_scope, does not touch records outside of the import scope' do
      # other sections already in db, which should be deleted
      FactoryBot.create_list(:student_section_assignment, 20)
      expect(StudentSectionAssignment.all.size).to eq 20

      # new row to import
      row = make_test_row()
      importer = make_importer_for_deleting_rows_tests(school_scope: ['SHS'])
      log = importer.instance_variable_get(:@log)
      importer.send(:import_row, row)
      expect(StudentSectionAssignment.all.size).to eq 21

      # sync should delete
      sync_records(importer)
      expect(log.output).to include('records_within_import_scope.size: 1 in Insights')
      expect(log.output).to include('@marked_ids.size = 1')
      expect(StudentSectionAssignment.count).to eq(21)
    end
  end

  describe '#matching_insights_record_for_row' do
    before { TestPals.seed_somerville_schools_for_test! }

    def create_test_music_records_for_school(school)
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      student = FactoryBot.create(:student, school: school)
      course = FactoryBot.create(:course, course_number: 'F100', school: school)
      section = FactoryBot.create(:section, {
        room_number: '101',
        course: course,
        section_number: 'MUSIC-005',
        term_local_id: 'FY',
        district_school_year: district_school_year
      })
      [district_school_year, student, section]
    end

    it 'scope the matching by section_number to within proper school' do
      # existing db, with similar records across schools
      _, _, _ = create_test_music_records_for_school(School.find_by_local_id('BRN'))
      district_school_year, healey_student, healey_section = create_test_music_records_for_school(School.find_by_local_id('HEA'))
      _, _, _ = create_test_music_records_for_school(School.find_by_local_id('WSNS'))
      expect(Course.all.size).to eq 3
      expect(Section.all.size).to eq 3

      # import row
      importer = make_importer_for_import_row_test()
      maybe_record = importer.send(:matching_insights_record_for_row, {
        room_number: '202-this-value-changed',
        local_id: healey_student.local_id,
        course_number: 'F100',
        section_number: 'MUSIC-005',
        school_local_id: 'HEA',
        term_local_id: 'FY',
        district_school_year: district_school_year
      })
      expect(maybe_record.student).to eq(healey_student)
      expect(maybe_record.section).to eq(healey_section)
    end

    it 'returns nil if fields are missing and no match can be made' do
      section = FactoryBot.create(:section)
      student = FactoryBot.create(:high_school_student)
      importer = make_importer_for_import_row_test()
      maybe_record = importer.send(:matching_insights_record_for_row, {
        local_id: student.local_id,
        section_number: section.section_number
      })
      expect(maybe_record).to eq nil
    end
  end
end
