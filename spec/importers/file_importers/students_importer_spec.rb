require 'rails_helper'

RSpec.describe StudentsImporter do
  def make_students_importer(options = {})
    StudentsImporter.new(options: {
      school_scope: nil,
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
    transformer = StreamingCsvTransformer.new(log)
    transformer.transform(file)
  end

  def get_fixture_row_by_index(target_index, filename)
    test_csv_from_file(fixture_filename).each_with_index do |row, index|
      next unless index == target_index
      return row.to_h
    end
    nil
  end

  def test_row_from_fixture
    get_fixture_row_by_index(0, fixture_filename)
  end

  describe '#import integration tests' do
    let!(:log) { LogHelper::FakeLog.new }
    let!(:importer) { make_students_importer(log: log) }
    let!(:fixture_filename) { "#{Rails.root}/spec/fixtures/fake_students_export.txt" }

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
      healey = School.create(local_id: 'HEA')
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

  describe '#import_row' do
    context 'good data' do
      let!(:high_school) { School.create(local_id: 'SHS') }
      let!(:healey) { School.create(local_id: 'HEA') }
      let!(:brown) { School.create(local_id: 'BRN') }

      let!(:log) { LogHelper::FakeLog.new }
      let!(:importer) { make_students_importer(log: log) }
      before { mock_importer_with_csv(importer, "#{Rails.root}/spec/fixtures/fake_students_export.txt") }

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
          expect(log.output).to include(':destroyed_records_count=>0')
          expect(log.output).to include('Skipping the call to  RecordSyncer#delete_unmarked_records')
        end
      end

      context 'when an existing student in the database' do
        before do
          Student.create!({
            first_name: 'Ryan',
            last_name: 'Rodriguez',
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
          { state_id: nil, full_name: 'Hoag, George', home_language: 'English', grade: '', homeroom: '101' }
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
  end
end
