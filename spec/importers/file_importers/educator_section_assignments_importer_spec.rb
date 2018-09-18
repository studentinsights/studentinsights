require 'rails_helper'

RSpec.describe EducatorSectionAssignmentsImporter do
  def make_importer(options = {})
    EducatorSectionAssignmentsImporter.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    }.merge(options))
  end

  describe '#import integration tests' do
    def mocked_importer_with_csv(importer, filename)
      csv = test_csv_from_file(filename)
      allow(importer).to receive(:download_csv).and_return(csv)
      importer
    end

    def test_csv_from_file(filename)
      file = File.read(filename)
      transformer = StreamingCsvTransformer.new(LogHelper::FakeLog.new)
      transformer.transform(file)
    end

    let!(:section) { FactoryBot.create(:section) }
    let!(:educator) { FactoryBot.create(:educator) }
    let!(:high_school) do
      TestPals.seed_somerville_schools_for_test!
      School.find_by_local_id('SHS')
    end

    before do
      FactoryBot.create(:educator, local_id: nil, login_name: 'oguillen')
      FactoryBot.create(:educator, local_id: nil, login_name: 'arodriguez')
      FactoryBot.create(:educator, local_id: '9111', login_name: 'djeter')
      FactoryBot.create(:educator, local_id: '9222', login_name: 'ngarciaparra')
      FactoryBot.create(:educator, local_id: '9333', login_name: 'mtejada')
    end

    let!(:shs_history) { FactoryBot.create(:course, course_number: 'SOC6', school: high_school) }
    let!(:shs_ela) { FactoryBot.create(:course, course_number: 'ELA6', school: high_school) }
    let!(:shs_math) { FactoryBot.create(:course, course_number: 'ALG2', school: high_school) }
    let!(:shs_history_section) { FactoryBot.create(:section, course: shs_history, section_number: 'SOC6-001') }
    let!(:shs_ela_section) { FactoryBot.create(:section, course: shs_ela, section_number: 'ELA6-002') }
    let!(:shs_math_section) { FactoryBot.create(:section, course: shs_math, section_number: 'ALG2-004') }

    let!(:log) { LogHelper::FakeLog.new }
    let!(:importer) do
      fixture_file = "#{Rails.root}/spec/fixtures/educator_section_assignment_export.txt"
      mocked_importer_with_csv(make_importer(log: log), fixture_file)
    end

    it 'works' do
      importer.import

      expect(EducatorSectionAssignment.count).to eq 4
      expect(log.output).to include ':passed_nil_record_count=>1'
      expect(log.output).to include ':created_rows_count=>4'
    end

    it 'syncs when existing records' do
      # will be unchanged
      EducatorSectionAssignment.create!({
        educator: Educator.find_by_login_name('ngarciaparra'),
        section: shs_history_section
      })
      # will be deleted
      EducatorSectionAssignment.create!({
        educator: Educator.find_by_login_name('mtejada'),
        section: shs_history_section
      })
      expect(EducatorSectionAssignment.count).to eq 2

      importer.import
      expect(log.output).to include ':passed_nil_record_count=>1'
      expect(log.output).to include ':unchanged_rows_count=>1'
      expect(log.output).to include ':created_rows_count=>3'
      expect(log.output).to include ':destroyed_records_count=>1'
      expect(EducatorSectionAssignment.count).to eq 4
    end
  end

  describe '#import_row' do
    let!(:school) { FactoryBot.create(:shs) }
    let!(:section) { FactoryBot.create(:section) }
    let!(:educator) { FactoryBot.create(:educator, login_name: 'pmartinez') }

    context 'happy path' do
      let(:row) {
        {
          login_name: 'pmartinez',
          course_number:section.course.course_number,
          school_local_id: 'SHS',
          section_number:section.section_number,
          term_local_id:'FY'
        }
      }

      before do
        make_importer.send(:import_row, row)
      end

      it 'creates an educator section assignment' do
        expect(EducatorSectionAssignment.count).to eq(1)
      end

      it 'assigns the proper student to the proper section' do
        expect(EducatorSectionAssignment.first.educator).to eq(educator)
        expect(EducatorSectionAssignment.first.section).to eq(section)
      end
    end

    context 'educator lasid is missing' do
      let(:row) { { course_number:section.course.course_number,
                    school_local_id: 'SHS',
                    section_number:section.section_number,
                    term_local_id:'FY'
                } }

      before do
        make_importer.send(:import_row, row)
      end

      it 'does not create an educator section assignment' do
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    context 'section is missing' do
      let(:row) do
        {
          login_name: 'pmartinez',
          course_number:section.course.course_number,
          school_local_id: 'SHS',
          term_local_id:'FY'
        }
      end

      before do
        make_importer.send(:import_row, row)
      end

      it 'does not create an educator section assignment' do
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    context 'educator does not exist' do
      let(:row) { { login_name: 'notexisting',
                  course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  section_number:section.section_number,
                  term_local_id:'FY'
              } }

      before do
        make_importer.send(:import_row, row)
      end

      it 'does not create an educator section assignment' do
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    context 'section does not exist' do
      let(:row) { { local_id: educator.local_id,
                  course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  section_number:'NO EXIST',
                  term_local_id:'FY'
              } }

      before do
        make_importer.send(:import_row, row)
      end

      it 'does not create an educator section assignment' do
        expect(EducatorSectionAssignment.count).to eq(0)
      end
    end

    describe 'deleting rows' do
      def sync_records(importer)
        syncer = importer.instance_variable_get(:@syncer)
        syncer.delete_unmarked_records!(importer.send(:records_within_scope))
        nil
      end

      let(:log) { LogHelper::Redirect.instance.file }
      let!(:school) { FactoryBot.create(:shs) }
      let!(:section) { FactoryBot.create(:section) }
      let!(:educator) { FactoryBot.create(:educator, login_name: 'pmartinez') }
      let(:row) { {
        login_name: 'pmartinez',
        course_number:section.course.course_number,
        school_local_id: section.course.school.local_id,
        section_number:section.section_number,
        term_local_id:section.term_local_id
      } }

      context 'happy path' do
        let(:educator_section_assignments_importer) do
          make_importer(school_scope: School.pluck(:local_id))
        end

        before do
          FactoryBot.create_list(:educator_section_assignment,20)
          FactoryBot.create(:educator_section_assignment, educator_id: educator.id, section_id: section.id)

          educator_section_assignments_importer.send(:import_row, row)
          sync_records(educator_section_assignments_importer)
        end

        it 'deletes all student section assignments except the recently imported one' do
          expect(EducatorSectionAssignment.count).to eq(1)
        end
      end

      context 'delete only stale assignments from schools being imported' do
        let(:educator_section_assignments_importer) do
          make_importer(school_scope: ['SHS'])
        end

        before do
          FactoryBot.create_list(:educator_section_assignment,20)
          FactoryBot.create(:educator_section_assignment, educator_id: educator.id, section_id: section.id)

          educator_section_assignments_importer.send(:import_row, row)
          sync_records(educator_section_assignments_importer)
        end

        it 'deletes all student section assignments for this school except the recently imported one' do
          expect(EducatorSectionAssignment.count).to eq(21)
        end
      end
    end
  end

  describe '#matching_insights_record_for_row' do
    let!(:educator) { FactoryBot.create(:educator, login_name: 'pmartinez') }
    let!(:section) { FactoryBot.create(:section) }
    let!(:importer) { make_importer }

    it 'works when match' do
      maybe_assignment_record = make_importer.send(:matching_insights_record_for_row, {
        login_name: 'pmartinez',
        section_number: section.section_number
      })
      expect(maybe_assignment_record.persisted?).to eq false
      expect(maybe_assignment_record.educator_id).to eq educator.id
      expect(maybe_assignment_record.section_id).to eq section.id
    end
  end
end
