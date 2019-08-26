require 'rails_helper'

RSpec.describe EducatorSectionAssignmentsImporter do
  def make_importer(options = {})
    EducatorSectionAssignmentsImporter.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    }.merge(options))
  end

  def make_importer_mocked_for_unit_test(options = {})
    log = LogHelper::FakeLog.new
    importer = make_importer({log: log}.merge(options))
    importer.instance_variable_set(:@school_ids_dictionary, importer.send(:build_school_ids_dictionary))
    [importer, log]
  end

  def mocked_importer_with_csv(importer, csv)
    allow(importer).to receive(:download_csv).and_return(csv)
    importer
  end

  def test_district_school_year
    time_now = TestPals.new.time_now
    district_school_year = 1 + SchoolYear.to_school_year(time_now)
    [district_school_year, time_now]
  end

  def make_importer_with_fixture(district_school_year)
    fixture_file = "#{Rails.root}/spec/fixtures/educator_section_assignment_export.txt"
    file = File.read(fixture_file)
    file_with_school_year = file.gsub('<district_school_year>', district_school_year.to_s)
    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new)
    csv = transformer.transform(file_with_school_year)

    log = LogHelper::FakeLog.new
    importer = mocked_importer_with_csv(make_importer(log: log), csv)
    [importer, log]
  end

  def create_records_for_tests_with_fixture_file(district_school_year)
    TestPals.seed_somerville_schools_for_test!
    high_school = School.find_by_local_id('SHS')

    # educators
    FactoryBot.create(:educator, local_id: nil, login_name: 'oguillen')
    FactoryBot.create(:educator, local_id: nil, login_name: 'arodriguez')
    FactoryBot.create(:educator, local_id: '9111', login_name: 'djeter')
    FactoryBot.create(:educator, local_id: '9222', login_name: 'ngarciaparra')
    FactoryBot.create(:educator, local_id: '9333', login_name: 'mtejada')

    # courses and sections
    shs_history = FactoryBot.create(:course, course_number: 'SOC6', school: high_school)
    shs_ela = FactoryBot.create(:course, course_number: 'ELA6', school: high_school)
    shs_math = FactoryBot.create(:course, course_number: 'ALG2', school: high_school)
    shs_history_section = FactoryBot.create(:section, course: shs_history, section_number: 'SOC6-001', district_school_year: district_school_year)
    _ = FactoryBot.create(:section, course: shs_ela, section_number: 'ELA6-002', district_school_year: district_school_year)
    _ = FactoryBot.create(:section, course: shs_math, section_number: 'ALG2-004', district_school_year: district_school_year)
    {
      shs_history_section: shs_history_section
    }
  end

  def make_test_row(district_school_year, options = {})
    school = options.has_key?(:school) ? options[:school] : FactoryBot.create(:shs)
    course = FactoryBot.create(:course, school: school)
    section = FactoryBot.create(:section, course: course, district_school_year: district_school_year)
    educator = FactoryBot.create(:educator)
    row = {
      login_name: educator.login_name,
      course_number: section.course.course_number,
      school_local_id: school.local_id,
      section_number: section.section_number,
      term_local_id: 'FY',
      district_school_year: district_school_year
    }
    [row, educator, section]
  end

  describe '#import integration tests' do
    it 'works' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        create_records_for_tests_with_fixture_file(district_school_year)
        importer, log = make_importer_with_fixture(district_school_year)
        importer.import

        expect(log.output).to include '@invalid_educator_count: 1'
        expect(log.output).to include ':passed_nil_record_count=>1'
        expect(log.output).to include ':created_rows_count=>4'
        expect(EducatorSectionAssignment.count).to eq 4
      end
    end

    it 'syncs when existing records' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        test_records = create_records_for_tests_with_fixture_file(district_school_year)
        
        # will be unchanged
        EducatorSectionAssignment.create!({
          educator: Educator.find_by_login_name('ngarciaparra'),
          section: test_records[:shs_history_section]
        })
        # will be deleted
        EducatorSectionAssignment.create!({
          educator: Educator.find_by_login_name('mtejada'),
          section: test_records[:shs_history_section]
        })
        expect(EducatorSectionAssignment.count).to eq 2

        # run import
        importer, log = make_importer_with_fixture(district_school_year)
        importer.import
        expect(log.output).to include ':passed_nil_record_count=>1'
        expect(log.output).to include ':unchanged_rows_count=>1'
        expect(log.output).to include ':created_rows_count=>3'
        expect(log.output).to include ':destroyed_records_count=>1'
        expect(EducatorSectionAssignment.count).to eq 4
      end
    end
  end

  describe '#import_row' do
    it 'assigns the proper student to the proper section' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, educator, section = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        importer.send(:import_row, row)
        expect(EducatorSectionAssignment.count).to eq(1)
        expect(EducatorSectionAssignment.first.educator).to eq(educator)
        expect(EducatorSectionAssignment.first.section).to eq(section)
      end
    end

    it 'does not import if educator login_name is empty' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, _, _ = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        importer.send(:import_row, row.merge(login_name: ''))
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    it 'does not import if section_number is empty' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, _, _ = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        importer.send(:import_row, row.merge(section_number: ''))
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    it 'does not import if eduactor login_name does not reference valid record' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, _, _ = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        importer.send(:import_row, row.merge(login_name: 'DOES_NOT_EXIST'))
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    it 'does not import if section_number does not reference valid record' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, _, _ = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        importer.send(:import_row, row.merge(section_number: 'DOES_NOT_EXIST'))
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end
  end

  describe 'deleting rows' do
    def sync_records(importer)
      syncer = importer.instance_variable_get(:@syncer)
      syncer.delete_unmarked_records!(importer.send(:records_within_scope))
      nil
    end

    it 'deletes all student section assignments except the recently imported one' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        # existing
        FactoryBot.create_list(:educator_section_assignment, 20)
        expect(EducatorSectionAssignment.all.size).to eq 20

        # import new one
        row, _, _ = make_test_row(district_school_year)
        importer, log = make_importer_mocked_for_unit_test(school_scope: School.pluck(:local_id))
        importer.send(:import_row, row)
        expect(EducatorSectionAssignment.all.size).to eq 21
        
        # delete older records after sync
        sync_records(importer)
        expect(log.output).to include 'records_within_import_scope.size: 21 in Insights'
        expect(log.output).to include '@marked_ids.size = 1 from this import'
        expect(log.output).to include 'records_to_process.size: 20 within scope'
        expect(EducatorSectionAssignment.all.size).to eq 1
      end
    end

    it 'respects school_scope when syncing' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        # existing
        FactoryBot.create_list(:educator_section_assignment, 20)
        expect(EducatorSectionAssignment.all.size).to eq 20

        # import new one
        row, _, _ = make_test_row(district_school_year)
        importer, log = make_importer_mocked_for_unit_test(school_scope: ['SHS'])
        importer.send(:import_row, row)
        expect(EducatorSectionAssignment.all.size).to eq 21
        
        # delete older records after sync
        sync_records(importer)
        expect(log.output).to include 'records_within_import_scope.size: 1 in Insights'
        expect(log.output).to include '@marked_ids.size = 1 from this import'
        expect(log.output).to include 'records_to_process.size: 0 within scope'
        expect(EducatorSectionAssignment.all.size).to eq 21
      end
    end
  end

  describe '#matching_insights_record_for_row' do
    it 'works when match exists' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, educator, section = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        maybe_assignment_record = importer.send(:matching_insights_record_for_row, row)
        expect(maybe_assignment_record.persisted?).to eq false
        expect(maybe_assignment_record.educator_id).to eq educator.id
        expect(maybe_assignment_record.section_id).to eq section.id
      end
    end

    it 'does not match when different term_local_id' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        row, _, _ = make_test_row(district_school_year)
        importer, _ = make_importer_mocked_for_unit_test()
        maybe_assignment_record = importer.send(:matching_insights_record_for_row, row.merge({
          term_local_id: 'Q1', # different value
        }))
        expect(maybe_assignment_record).to eq nil
      end
    end

    it 'scopes the matching by section_number to within proper school' do
      district_school_year, time_now = test_district_school_year()
      Timecop.freeze(time_now) do
        # existing db, with similar records across schools
        TestPals.seed_somerville_schools_for_test!
        _, _, _ = make_test_row(district_school_year, school: School.find_by_local_id('BRN'))
        row, educator, healey_section = make_test_row(district_school_year, school: School.find_by_local_id('HEA'))
        _, _, _ = make_test_row(district_school_year, school: School.find_by_local_id('WSNS'))
        expect(Course.all.size).to eq 3
        expect(Section.all.size).to eq 3

        # matches for the correct school
        importer, _ = make_importer_mocked_for_unit_test()
        maybe_assignment_record = importer.send(:matching_insights_record_for_row, row)
        expect(maybe_assignment_record.educator).to eq educator
        expect(maybe_assignment_record.section).to eq healey_section
      end
    end
  end
end
