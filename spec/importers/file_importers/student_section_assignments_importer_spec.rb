require 'rails_helper'

RSpec.describe StudentSectionAssignmentsImporter do
  def make_importer(options = {})
    StudentSectionAssignmentsImporter.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    }.merge(options))
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

    def importer_for_import_row_test
      importer = make_importer()
      importer.instance_variable_set(:@school_ids_dictionary, importer.send(:build_school_ids_dictionary))
      importer
    end

    it 'creates a student section assignment' do
      row, _, _ = create_test_records_and_test_row()
      importer = importer_for_import_row_test()
      
      importer.send(:import_row, row)
      expect(StudentSectionAssignment.count).to eq(1)
    end

    it 'assigns the proper student to the proper section' do
      row, student, section = create_test_records_and_test_row()
      importer = importer_for_import_row_test()

      importer.send(:import_row, row)
      expect(StudentSectionAssignment.first.student).to eq(student)
      expect(StudentSectionAssignment.first.section).to eq(section)
    end

    it 'is invalid if LASID field is missing' do
      row, _, _ = create_test_records_and_test_row()
      importer = importer_for_import_row_test()
      importer.send(:import_row, row.except(:local_id))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if section_number field is missing' do
      row, _, _ = create_test_records_and_test_row()
      importer = importer_for_import_row_test()
      importer.send(:import_row, row.except(:section_number))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if LASID reference is not in db' do
      row, _, _ = create_test_records_and_test_row()
      importer = importer_for_import_row_test()
      importer.send(:import_row, row.merge(local_id: 'DOES NOT EXIST'))
      expect(StudentSectionAssignment.count).to eq(0)
    end

    it 'is invalid if section_number reference is not in db' do
      row, _, _ = create_test_records_and_test_row()
      importer = importer_for_import_row_test()
      importer.send(:import_row, row.merge(section_number: 'DOES NOT EXIST'))
      expect(StudentSectionAssignment.count).to eq(0)
    end
  end

  describe 'deleting rows' do
    def sync_records(importer)
      syncer = importer.instance_variable_get(:@syncer)
      syncer.delete_unmarked_records!(importer.send(:records_within_scope))
      nil
    end

    let(:log) { LogHelper::Redirect.instance.file }
    let!(:section) { FactoryBot.create(:section) }
    let!(:student) { FactoryBot.create(:student) }
    let(:row) {
      {
        local_id: student.local_id,
        course_number: section.course.course_number,
        school_local_id: section.course.school.local_id,
        section_number: section.section_number,
        term_local_id: section.term_local_id
      }
    }

    context 'happy path' do
      let(:student_section_assignments_importer) do
        make_importer_with_initialization(school_scope: School.pluck(:local_id))
      end

      before do
        FactoryBot.create_list(:student_section_assignment, 20)
        FactoryBot.create(:student_section_assignment, student_id: student.id, section_id: section.id)

        student_section_assignments_importer.send(:import_row, row)
        sync_records(student_section_assignments_importer)
      end

      it 'deletes all student section assignments except the recently imported one' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'delete only stale assignments from schools being imported' do
      let(:student_section_assignments_importer) do
        make_importer_with_initialization(school_scope: ['SHS'])
      end

      before do
        FactoryBot.create_list(:student_section_assignment, 20)
        FactoryBot.create(:student_section_assignment, student_id: student.id, section_id: section.id)

        student_section_assignments_importer.send(:import_row, row)
        sync_records(student_section_assignments_importer)
      end

      it 'deletes all student section assignments for that school except the recently imported one' do
        expect(StudentSectionAssignment.count).to eq(21)
      end
    end
  end

  describe '#matching_insights_record_for_row' do
    let(:importer) { make_importer_with_initialization }
    let(:student_section_assignment) { importer.send(:matching_insights_record_for_row, row) }
    let(:healey_school) { School.find_by_local_id('HEA') }
    let(:brown_school) { School.find_by_local_id('BRN') }

    context 'happy path' do
      let!(:student) { FactoryBot.create(:high_school_student) }
      let!(:course) {
        FactoryBot.create(
          :course, course_number: 'F100', school: healey_school
        )
      }
      let!(:section) {
        FactoryBot.create(
          :section, course: course, section_number: 'MUSIC-005', term_local_id: 'FY'
        )
      }

      let(:row) {
        {
          local_id: student.local_id,
          section_number: 'MUSIC-005',
          course_number: 'F100',
          school_local_id: 'HEA',
          term_local_id: 'FY'
        }
      }

      it 'assigns the correct values' do
        expect(student_section_assignment.student).to eq(student)
        expect(student_section_assignment.section).to eq(section)
      end
    end

    context 'section with same section_number at different school' do
      let!(:another_course) {
        FactoryBot.create(:course, course_number: 'F100', school: brown_school)
      }
      let!(:another_section) {
        FactoryBot.create(
          :section, course: another_course, section_number: 'MUSIC-005', term_local_id: 'FY'
        )
      }

      let!(:student) { FactoryBot.create(:high_school_student) }
      let!(:course) {
        FactoryBot.create(:course, course_number: 'F100', school: healey_school)
      }
      let!(:section) {
        FactoryBot.create(
          :section, course: course, section_number: 'MUSIC-005', term_local_id: 'FY'
        )
      }

      let(:row) {
        {
          local_id: student.local_id,
          section_number: 'MUSIC-005',
          course_number: 'F100',
          school_local_id: 'HEA',
          term_local_id: 'FY'
        }
      }

      it 'assigns the correct values' do
        expect(student_section_assignment.student).to eq(student)
        expect(student_section_assignment.section).to eq(section)
      end
    end

    context 'no course info or school_local_id' do
      let!(:section) { FactoryBot.create(:section) }
      let!(:student) { FactoryBot.create(:high_school_student) }
      let(:row) {
        {
          local_id: student.local_id,
          section_number: section.section_number,
        }
      }

      it 'returns nil' do
        expect(student_section_assignment).to be_nil
      end
    end
  end
end
