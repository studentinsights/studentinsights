require 'rails_helper'

RSpec.describe StudentSectionGradesImporter do
  def make_importer(options = {})
    log = LogHelper::FakeLog.new
    importer = StudentSectionGradesImporter.new(options: {
      school_scope: nil,
      log: log
    }.merge(options))
    [importer, log]
  end

  def mock_importer_with_fixture(importer)
    filename = "#{Rails.root}/spec/fixtures/student_section_grades_fixture.csv"
    file = File.read(filename)
    transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new, {
      headers: StudentSectionGradesImporter::CSV_HEADERS
    })
    csv = transformer.transform(file)
    allow(importer).to receive(:download_csv).and_return(csv)
    importer
  end

  # the db state has to match the fixture in various ways
  # for the import to work (eg, students, sections, assignments)
  def create_db_state_for_fixture(options = {})
    district_school_year = options.fetch(:district_school_year, nil)

    # schools
    TestPals.seed_somerville_schools_for_test!
    east = School.find_by_local_id('ESCS')
    high_school = School.find_by_local_id('SHS')

    # courses and sections
    east_history = FactoryBot.create(:course, course_number: 'SOC6', school: east)
    shs_history = FactoryBot.create(:course, course_number: 'SOC6', school: high_school)
    shs_ela = FactoryBot.create(:course, course_number: 'ELA6', school: high_school)
    shs_math = FactoryBot.create(:course, course_number: 'ALG2', school: high_school)
    east_history_section = FactoryBot.create(:section, course: east_history, section_number: 'SOC6-001', district_school_year: district_school_year)
    shs_history_section = FactoryBot.create(:section, course: shs_history, section_number: 'SOC6-001', district_school_year: district_school_year)
    shs_ela_section = FactoryBot.create(:section, course: shs_ela, section_number: 'ELA6-002', district_school_year: district_school_year)
    _ = FactoryBot.create(:section, course: shs_math, section_number: 'ALG2-004', district_school_year: district_school_year)

    # student assignments, matching the fixture file
    student_one = FactoryBot.create(:student, local_id: '111')
    student_two = FactoryBot.create(:student, local_id: '222')
    student_three = FactoryBot.create(:student, local_id: '333')
    FactoryBot.create(:student_section_assignment, {
      student: student_three,
      section: shs_history_section
    })
    FactoryBot.create(:student_section_assignment, {
      student: student_one,
      section: east_history_section
    })
    FactoryBot.create(:student_section_assignment, {
      student: student_two,
      section: east_history_section
    })
    FactoryBot.create(:student_section_assignment, {
      student: student_three,
      section: shs_ela_section
    })
    nil
  end

  describe '#import' do
    it 'does not match any district_school_year: nil Sections' do
      create_db_state_for_fixture(district_school_year: nil)
      importer, log = make_importer()
      mock_importer_with_fixture(importer)

      # db state before
      expect(StudentSectionAssignment.all.size).to eq 4
      numeric_grades_before = StudentSectionAssignment.all.pluck(:grade_numeric)
      letter_grades_before = StudentSectionAssignment.all.pluck(:grade_letter)

      # unchanged after
      importer.import
      expect(log.output).to include('@invalid_student_count: 1')
      expect(log.output).to include('@section_not_found_in_index_count: 5')
      expect(StudentSectionAssignment.all.size).to eq 4
      expect(StudentSectionAssignment.all.pluck(:grade_numeric)).to eq numeric_grades_before
      expect(StudentSectionAssignment.all.pluck(:grade_letter)).to eq letter_grades_before
    end

    it 'updates records as expected if district_school_year matches' do
      time_now = TestPals.new.time_now
      district_school_year = 1 + SchoolYear.to_school_year(time_now)
      Timecop.freeze(time_now) do
        create_db_state_for_fixture(district_school_year: district_school_year)
        importer, log = make_importer()
        mock_importer_with_fixture(importer)

        # db state before
        expect(StudentSectionAssignment.all.size).to eq 4

        # after import, has same state as fixture file
        importer.import
        expect(log.output).to include('@invalid_student_count: 1')
        expect(log.output).to include('@section_not_found_in_index_count: 1')
        expect(StudentSectionAssignment.all.size).to eq 4
        db_records_json = StudentSectionAssignment.all.as_json({
          include: {
            section: {only: [:section_number, :term_local_id]},
            student: {only: [:local_id]}
          },
          except: [
            :id,
            :section_id,
            :student_id,
            :created_at,
            :updated_at
          ]
        })
        expect(db_records_json).to contain_exactly(*[
          { "section"=>{"section_number"=>"SOC6-001", "term_local_id"=>"FY"},"student"=>{"local_id"=>"333"}, "grade_numeric"=>"85.12", "grade_letter"=>"B+" },
          { "section"=>{"section_number"=>"SOC6-001", "term_local_id"=>"FY"},"student"=>{"local_id"=>"111"}, "grade_numeric"=>"85.45", "grade_letter"=>"B+" },
          { "section"=>{"section_number"=>"SOC6-001", "term_local_id"=>"FY"},"student"=>{"local_id"=>"222"}, "grade_numeric"=>"85.78", "grade_letter"=>"B+" },
          { "section"=>{"section_number"=>"ELA6-002", "term_local_id"=>"FY"},"student"=>{"local_id"=>"333"}, "grade_numeric"=>"85.99", "grade_letter"=>"B+" },
        ])
      end
    end
  end

  describe '#import_row' do
    def create_records_for_unit_tests(district_school_year)
      school = FactoryBot.create(:shs)
      course = FactoryBot.create(:course, school: school)
      section = FactoryBot.create(:section, course: course, district_school_year: district_school_year)
      student = FactoryBot.create(:student)
      ssa = FactoryBot.create(:student_section_assignment, {
        student: student,
        section: section,
        grade_numeric: 42.42,
        grade_letter: 'F'
      })
      ssa
    end

    def setup_for_unit_test(options = {}, &block)
      time_now = TestPals.new.time_now
      default_district_school_year = 1 + SchoolYear.to_school_year(time_now)
      district_school_year = options.fetch(:district_school_year, default_district_school_year)
      district_school_year_for_records = options.has_key?(:district_school_year_for_records) ? options[:district_school_year_for_records] : default_district_school_year
      Timecop.freeze(time_now) do
        ssa = create_records_for_unit_tests(district_school_year_for_records)
        importer, _ = make_importer(district_school_year: district_school_year)
        simulate_importer_setup(importer)
        block.call(importer, ssa, {
          section_number: ssa.section.section_number,
          student_local_id: ssa.student.local_id,
          school_local_id: 'SHS',
          course_number: ssa.section.course_number,
          term_local_id: 'FY',
          grade: '85.12 B+'
        })
      end
    end

    # since we're reaching into the `import_row` method, gotta call the setup
    def simulate_importer_setup(importer)
      importer.instance_variable_get(:@student_ids_map).reset!
      importer.instance_variable_set(:@section_number_map, importer.send(:build_section_number_map))
      nil
    end

    it 'works on happy path' do
      setup_for_unit_test() do |importer, ssa, row|
        importer.send(:import_row, row)
        ssa.reload
        expect(ssa.grade_numeric).to eq(85.12)
        expect(ssa.grade_letter).to eq('B+')
      end
    end

    it 'does not update existing records referencing Sections with district_school_year:nil' do
      setup_for_unit_test(district_school_year_for_records: nil) do |importer, ssa, row|
        importer.send(:import_row, row)
        ssa.reload # unchanged
        expect(ssa.grade_numeric).to eq(42.42)
        expect(ssa.grade_letter).to eq('F')
      end
    end

    it 'updates to nil when blank grade' do
      setup_for_unit_test() do |importer, ssa, row|
        importer.send(:import_row, row.merge(grade: ''))
        ssa.reload
        expect(ssa.grade_numeric).to eq(nil)
        expect(ssa.grade_letter).to eq(nil)
      end
    end

    it 'updates to nil when nonsense grade' do
      setup_for_unit_test() do |importer, ssa, row|
        importer.send(:import_row, row.merge(grade: 'NONSENSE'))
        ssa.reload
        expect(ssa.grade_numeric).to eq(nil)
        expect(ssa.grade_letter).to eq(nil)
      end
    end

    it 'does not update or create when student_local_id is missing' do
      setup_for_unit_test() do |importer, ssa, row|
        importer.send(:import_row, row.merge(student_local_id: ''))
        ssa.reload
        expect(ssa.grade_numeric).to eq(42.42)
        expect(ssa.grade_letter).to eq('F')
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    it 'does not update or create when section_number is missing' do
      setup_for_unit_test() do |importer, ssa, row|
        importer.send(:import_row, row.merge(section_number: ''))
        ssa.reload
        expect(ssa.grade_numeric).to eq(42.42)
        expect(ssa.grade_letter).to eq('F')
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'stores historical grades' do
      it 'creates new HistoricalGrade records' do
        setup_for_unit_test() do |importer, ssa, row|
          # verify records created
          expect {
            importer.send(:import_row, row.merge(grade: '85.0 B+'))
            importer.send(:import_row, row.merge(grade: '94.0 A'))
          }.to change(HistoricalGrade, :count).by(2)

          # verify content of records created in db
          historical_grades = HistoricalGrade.all.order(created_at: :asc).as_json(except: [
            :id,
            :created_at,
            :updated_at
          ])
          expect(historical_grades[0]).to eq({
            'student_id' => ssa.student.id,
            'section_id' => ssa.section.id,
            'course_number' => ssa.section.course_number,
            'section_number' => ssa.section.section_number,
            'grade' => '85.0 B+'
          })
          expect(historical_grades[1]).to eq({
            'student_id' => ssa.student.id,
            'section_id' => ssa.section.id,
            'course_number' => ssa.section.course_number,
            'section_number' => ssa.section.section_number,
            'grade' => '94.0 A'
          })
        end
      end
    end
  end
end
