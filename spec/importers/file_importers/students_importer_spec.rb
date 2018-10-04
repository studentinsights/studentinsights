require 'rails_helper'

RSpec.describe StudentsImporter do
  def make_students_importer(options = {})
    school_ids = PerDistrict.new.school_definitions_for_import.map { |school| school["local_id"] }
    StudentsImporter.new(options: {
      school_scope: school_ids,
      log: nil
    }.merge(options))
  end

  def mock_importer_with_csv(importer, filename)
    csv = test_csv_from_file(filename)
    allow(importer).to receive(:download_csv).and_return(csv)
    importer
  end

  def test_csv_from_file(filename)
    file = File.read(filename)
    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new) # these tests don't care about this log output
    transformer.transform(file)
  end

  def get_fixture_row_by_index(target_index, filename)
    test_csv_from_file(fixture_filename).each_with_index do |row, index|
      next unless index == target_index
      return row.to_h
    end
    nil
  end

  def test_row_from_fixture(options = {})
    get_fixture_row_by_index(options.fetch(:index, 0), fixture_filename)
  end

  def fixture_filename
    "#{Rails.root}/spec/fixtures/fake_students_export.txt"
  end

  describe '#import integration tests' do
    let!(:log) { LogHelper::FakeLog.new }
    let!(:importer) { make_students_importer(log: log) }
    before { TestPals.seed_somerville_schools_for_test! }

    it 'does not create Homeroom records' do
      mock_importer_with_csv(importer, fixture_filename)
      expect { importer.import }.to change { Homeroom.count }.by(0)
    end

    it 'does not delete records' do
      mock_importer_with_csv(importer, fixture_filename)
      importer.import
      expect(log.output).to include(':destroyed_records_count=>0')
    end

    it 'sets homeroom_id:nil when student is not active' do
      allow(importer).to receive(:download_csv).and_return([
        test_row_from_fixture.merge(enrollment_status: 'Withdrawn')
      ])
      importer.import
      expect(log.output).to include('@setting_nil_homeroom_because_not_active_count: 1')
    end

    it 'sets homeroom_id:nil when homeroom cannot be matched' do
      allow(importer).to receive(:download_csv).and_return([
        test_row_from_fixture.merge(homeroom: 'homeroom-name-that-does-not-exist')
      ])
      importer.import
      expect(log.output).to include('@could_not_match_homeroom_name_count: 1')
    end

    it 'sets homeroom_id:nil when homeroom field is nil' do
      allow(importer).to receive(:download_csv).and_return([
        test_row_from_fixture.merge(homeroom: nil)
      ])
      importer.import
      expect(log.output).to include('@nil_homeroom_count: 1')
    end

    it 'updates homeroom_id' do
      healey = School.find_by_local_id('HEA')
      first_homeroom = Homeroom.create!(name: 'HEA 001', school: healey)
      second_homeroom = Homeroom.create!(name: 'HEA 002', school: healey)
      allow(importer).to receive(:download_csv).and_return([
        test_row_from_fixture.merge(homeroom: first_homeroom.name),
        test_row_from_fixture.merge(homeroom: second_homeroom.name)
      ])
      expect {importer.import }.to change { Student.count }.by(1).and change { Homeroom.count }.by(0)

      expect(log.output).to include(':created_rows_count=>1')
      expect(log.output).to include(':updated_rows_count=>1')
    end
  end

  describe 'process_unmarked_records! integration tests' do
    it 'sets missing_from_last_export: true for students missing from the export' do
      # first import, all students in fixture
      TestPals.seed_somerville_schools_for_test!
      first_fixture_rows = (0..4).map {|index| test_row_from_fixture(index: index) }
      first_log = LogHelper::FakeLog.new
      first_importer = make_students_importer(log: first_log)
      allow(first_importer).to receive(:download_csv).and_return(first_fixture_rows)
      first_importer.import
      expect(Student.active.size).to eq 4

      # second one, with some students missing from export
      second_fixture_rows = first_fixture_rows.last(2)
      second_log = LogHelper::FakeLog.new
      second_importer = make_students_importer(log: second_log)
      allow(second_importer).to receive(:download_csv).and_return(second_fixture_rows)
      second_importer.import

      # Student records not included in the import are tagged as `missing_from_last_export` and
      # no longer considered active
      expect(second_log.output).to include('records_to_process.size: 3 within scope')
      expect(second_log.output).to include('@missing_from_last_export_count: 3')
      expect(Student.where(missing_from_last_export: true).size).to eq 3
      expect(Student.active.size).to eq 1
    end

    it 'does not set missing_from_last_export for existing elementary students when only importing SHS' do
      pals = TestPals.create!

      log = LogHelper::FakeLog.new
      importer = make_students_importer(log: log, school_scope: ['SHS'])
      allow(importer).to receive(:download_csv).and_return([])
      importer.import

      expect(log.output).to include('@missing_from_last_export_count: 3')
      expect(pals.shs.students.active.size).to eq 0
      expect(pals.shs.students.size).to eq 3
      expect(pals.shs.students.where(missing_from_last_export: true).size).to eq 3
      expect(pals.healey.students.active.size).to eq 1
      expect(pals.west.students.active.size).to eq 1
    end
  end

  describe '#import_row' do
    context 'good data' do
      before { TestPals.seed_somerville_schools_for_test! }
      let!(:high_school) { School.find_by_local_id('SHS') }
      let!(:healey) { School.find_by_local_id('HEA') }
      let!(:brown) { School.find_by_local_id('BRN') }

      let!(:log) { LogHelper::FakeLog.new }
      let!(:importer) { make_students_importer(log: log) }
      before { mock_importer_with_csv(importer, fixture_filename) }

      context 'no existing students in database' do
        it 'does not import students with far future registration dates' do
          importer.import
          expect(Student.count).to eq 4
          expect(Student.where(state_id: '1000000003').size).to eq 0
        end

        it 'imports student data correctly' do
          expect { importer.import }.to change { Student.count }.by(4)

          first_student = Student.find_by_state_id('1000000000')
          expect(first_student.reload.school).to eq healey
          expect(first_student.program_assigned).to eq 'Sp Ed'
          expect(first_student.limited_english_proficiency).to eq 'Fluent'
          expect(first_student.student_address).to eq '155 9th St, San Francisco, CA'
          expect(first_student.registration_date).to eq DateTime.new(2008, 2, 20)
          expect(first_student.free_reduced_lunch).to eq 'Not Eligible'
          expect(first_student.date_of_birth).to eq DateTime.new(1998, 7, 15)
          expect(first_student.race).to eq 'Black'
          expect(first_student.hispanic_latino).to eq false
          expect(first_student.gender).to eq 'F'
          expect(first_student.house).to eq ''
          expect(first_student.counselor).to eq nil

          second_student = Student.find_by_state_id('1000000002')
          expect(second_student.race).to eq 'White'
          expect(second_student.hispanic_latino).to eq true
          expect(second_student.gender).to eq 'F'

          shs_student = Student.find_by_state_id('1000000001')
          expect(shs_student.house).to eq 'Elm'
          expect(shs_student.counselor).to eq 'LABERGE'
        end

        it 'does not create Homeroom records if row[:homeroom] does not exist' do
          importer.import
          expect(Homeroom.count).to eq 0
          expect(Student.all.map(&:homeroom).uniq).to eq [nil]
          expect(log.output).to include('@could_not_match_homeroom_name_count: 5')
        end

        it 'does not delete any records' do
          importer.import
          expect(log.output).to include('process_unmarked_records starting...')
          expect(log.output).to include(':destroyed_records_count=>0')
        end
      end

      context 'when an existing student in the database' do
        before do
          Student.create!({
            first_name: 'Ryan',
            last_name: 'Rodriguez',
            state_id: '99100',
            local_id: '100',
            school: healey,
            grade: '7'
          })
        end
        it 'does not create new records for existing students' do
          expect(Student.count).to eq(1)
          importer.import
          expect(Student.count).to eq(4)
        end
      end

      context 'when students already imported' do
        before do
          importer.import
        end
        it 'does not create new records for existing students' do
          expect(Student.count).to eq(4)
          importer.import
          expect(Student.count).to eq(4)
        end
      end

      context 'student in database who has since graduated on to high school' do
        let!(:graduating_student) {
          FactoryBot.create(:student, local_id: '101', school: healey, grade: '8')   # Old data
        }

        it 'imports students' do
          expect { importer.import }.to change { Student.count }.by 3
        end

        it 'updates the student\'s data correctly' do
          importer.import

          expect(graduating_student.reload.school).to eq high_school
          expect(graduating_student.grade).to eq '10'
          expect(graduating_student.enrollment_status).to eq 'Active'
        end

      end

    end

    context 'validation failure (missing grade)' do
      let!(:log) { LogHelper::FakeLog.new }
      let!(:importer) { make_students_importer(log: log) }
      before do
        allow(importer).to receive(:download_csv).and_return([
          {
            state_id: nil,
            full_name: 'Hoag,
            George',
            home_language: 'English',
            grade: '',
            homeroom: '101',
            school_local_id: 'HEA'
          }
        ])
      end
      it 'logs an error and skips row' do
        importer.import
        expect(log.output).to include(':updated_rows_count=>0')
        expect(log.output).to include(':created_rows_count=>0')
        expect(log.output).to include(':invalid_rows_count=>1')
        expect(log.output).to include('@setting_nil_homeroom_because_not_active_count: 1')
        expect(Student.where(last_name: 'Hoag').size).to eq(0)
      end
    end

    context 'skips records outside school_scope' do
      let!(:log) { LogHelper::FakeLog.new }
      let!(:importer) { make_students_importer(log: log, school_scope: ['SHS']) }
      before do
        allow(importer).to receive(:download_csv).and_return([
          {
            state_id: nil,
            full_name: 'Hoag,
            George',
            home_language: 'English',
            grade: '',
            homeroom: '101',
            school_local_id: 'HEA'
          }
        ])
      end
      it 'logs an error and skips row' do
        importer.import
        expect(log.output).to include(':updated_rows_count=>0')
        expect(log.output).to include(':created_rows_count=>0')
        expect(log.output).to include(':invalid_rows_count=>0')
        expect(log.output).to include('@skipped_from_school_filter: 1')
        expect(Student.where(last_name: 'Hoag').size).to eq(0)
      end
    end
  end
end
