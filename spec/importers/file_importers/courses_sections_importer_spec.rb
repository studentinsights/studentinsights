require 'rails_helper'

RSpec.describe CoursesSectionsImporter do

  describe '#import_row' do
    let(:log) { LogHelper::Redirect.instance.file }
    let!(:school) { FactoryGirl.create(:shs) }

    context 'happy path' do
      let(:row) { { course_number:'ART-205',
                    course_description:'Handmade Ceramics I',
                    section_number:'ART-205B',
                    school_local_id: 'SHS',
                    term_local_id:'FY',
                    section_schedule:'3(M-R)',
                    section_room_number:'232B'
                } }
      let!(:import_record_detail) {FactoryGirl.create(:import_record_detail)}

        before do
          importer = described_class.new(nil, nil, log, nil, import_record_detail)
          importer.import_row(row)
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

        it 'logs one row processed, one row created' do
          expected_statuses = {
            "processed": 1,
            "excluded": 0,
            "created": 1,
            "updated": 0,
            "deleted": 0,
            "rejected": 0
          }
          expect(import_record_detail.rows_summary).to eq(expected_statuses)
        end
      end

      context 'updates correctly' do
        let!(:section) {FactoryGirl.create(:section)}
        let(:row) { { course_number:section.course_number,
                      course_description:section.course_description,
                      section_number:section.section_number,
                      school_local_id:section.course.school.local_id,
                      term_local_id:section.term_local_id,
                      section_schedule:section.schedule,
                      section_room_number:'NEW ROOM'
                  } }
        let!(:import_record_detail) {FactoryGirl.create(:import_record_detail)}

          before do
            importer = described_class.new(nil, nil, log, nil, import_record_detail)
            importer.import_row(row)
          end

          it 'leaves the course' do
            expect(Course.count).to eq(1)
          end

          it 'leaves the section' do
            expect(Section.count).to eq(1)
          end

          it 'updates the section' do
            section.reload
            expect(section.room_number).to eq("NEW ROOM")
          end

          it 'logs one row processed, one row updated' do
            expected_statuses = {
              "processed": 1,
              "excluded": 0,
              "created": 0,
              "updated": 1,
              "deleted": 0,
              "rejected": 0
            }
            expect(import_record_detail.rows_summary).to eq(expected_statuses)
          end
        end

      context 'missing school_local_id' do
        let(:row) { { course_number:'ART-205',
                    course_description:'Handmade Ceramics I',
                    section_number:'ART-205B',
                    term_local_id:'FY',
                    section_schedule:'3(M-R)',
                    section_room_number:'232B'
                } }
        let!(:import_record_detail) {FactoryGirl.create(:import_record_detail)}

        before do
          importer = described_class.new(nil, nil, log, nil, import_record_detail)
          importer.import_row(row)
        end

        it 'does not create a course' do
          expect(Course.count).to eq(0)
        end

        it 'does not create a section' do
          expect(Section.count).to eq(0)
        end

        it 'logs one row processed, one row created' do
          expected_statuses = {
            "processed": 1,
            "excluded": 0,
            "created": 0,
            "updated": 0,
            "deleted": 0,
            "rejected": 1
          }
          expect(import_record_detail.rows_summary).to eq(expected_statuses)
        end
      end
    end
  end
