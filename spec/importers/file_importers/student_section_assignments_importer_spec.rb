require 'rails_helper'

RSpec.describe StudentSectionAssignmentsImporter do
  before { School.seed_somerville_schools }
  let(:high_school) { School.find_by_local_id('SHS') }

  let(:student_section_assignments_importer) {
    described_class.new(options: {
      school_scope: nil, log: LogHelper::Redirect.instance.file
    })
  }

  describe '#import_row' do
    let!(:course) { FactoryBot.create(:course, school: high_school) }
    let!(:section) { FactoryBot.create(:section, course: course) }
    let!(:student) { FactoryBot.create(:student) }

    context 'happy path' do
      let(:row) {
        {
          local_id: student.local_id,
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: section.section_number,
          term_local_id: 'FY'
        }
      }

        before do
          student_section_assignments_importer.import_row(row)
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
      let(:row) {
        {
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: section.section_number,
          term_local_id: 'FY'
        }
      }

      before do
        student_section_assignments_importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'section is missing' do
      let(:row) {
        {
          local_id: student.local_id,
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          term_local_id: 'FY'
        }
      }

      before do
        student_section_assignments_importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'student does not exist' do
      let(:row) {
        {
          local_id: 'NO EXIST',
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: section.section_number,
          term_local_id: 'FY'
        }
      }

      before do
        student_section_assignments_importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end

    context 'section does not exist' do
      let(:row) {
        {
          local_id: student.local_id,
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: 'NO EXIST',
          term_local_id: 'FY'
        }
      }

      before do
        student_section_assignments_importer.import_row(row)
      end

      it 'does not create a student section assignment' do
        expect(StudentSectionAssignment.count).to eq(0)
      end
    end
  end

  describe '#delete_rows' do
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
      let(:student_section_assignments_importer) {
        described_class.new(options: {
          school_scope: School.pluck(:local_id), log: LogHelper::Redirect.instance.file
        })
      }

      before do
        FactoryBot.create_list(:student_section_assignment, 20)
        FactoryBot.create(:student_section_assignment, student_id: student.id, section_id: section.id)

        student_section_assignments_importer.import_row(row)
        student_section_assignments_importer.delete_rows
      end

      it 'deletes all student section assignments except the recently imported one' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'delete only stale assignments from schools being imported' do
      let(:student_section_assignments_importer) {
        described_class.new(options: {
          school_scope: ['SHS'], log: LogHelper::Redirect.instance.file
        })
      }

      before do
        FactoryBot.create_list(:student_section_assignment, 20)
        FactoryBot.create(:student_section_assignment, student_id: student.id, section_id: section.id)

        student_section_assignments_importer.import_row(row)
        student_section_assignments_importer.delete_rows
      end

      it 'deletes all student section assignments for that school except the recently imported one' do
        expect(StudentSectionAssignment.count).to eq(21)
      end
    end
  end
end
