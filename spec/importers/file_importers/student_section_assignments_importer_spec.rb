require 'rails_helper'

RSpec.describe StudentSectionAssignmentsImporter do
  describe '#import_row' do
    let(:log) { LogHelper::Redirect.instance.file }
    let!(:school) { FactoryGirl.create(:shs) }
    let!(:section) { FactoryGirl.create(:section) }
    let!(:student) { FactoryGirl.create(:student) }

    context 'happy path' do
      let(:row) { { local_id:student.local_id,
                    course_number:section.course.course_number,
                    school_local_id: 'SHS',
                    section_number:section.section_number,
                    term_local_id:'FY'
                } }

        before do
          described_class.new.import_row(row)
        end

        it 'creates a student section assignment' do
          expect(StudentSectionAssignment.count).to eq(1)
        end

        it 'assigns the proper student to the proper section' do
          expect(StudentSectionAssignment.first.student).to eq(student)
          expect(StudentSectionAssignment.first.section).to eq(section)
        end
    end

    context 'student lasid is missing' do
      let(:row) { { course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  section_number:section.section_number,
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'section is missing' do
      let(:row) { { local_id:student.local_id,
                  course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'student does not exist' do
      let(:row) { { local_id:'NO EXIST',
                  course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  section_number:section.section_number,
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'section does not exist' do
    let(:row) { { local_id:student.local_id,
                  course_number:section.course.course_number,
                  school_local_id: 'SHS',
                  section_number:'NO EXIST',
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end
  end

  describe '#delete_rows' do
    let(:log) { LogHelper::Redirect.instance.file }
    let!(:school) { FactoryGirl.create(:shs) }
    let!(:section) { FactoryGirl.create(:section) }
    let!(:student) { FactoryGirl.create(:student) }
    let(:row) { { local_id:student.local_id,
      course_number:section.course.course_number,
      school_local_id: section.course.school.local_id,
      section_number:section.section_number,
      term_local_id: section.term_local_id
    } }

    context 'happy path' do
      before do
        FactoryGirl.create_list(:student_section_assignment, 20)
        FactoryGirl.create(:student_section_assignment, student_id: student.id, section_id: section.id)

        ssa_importer = described_class.new
        ssa_importer.import_row(row)
        ssa_importer.delete_rows
      end

      it 'deletes all student section assignments except the recently imported one' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end
  end
end
