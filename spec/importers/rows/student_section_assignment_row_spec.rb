require 'rails_helper'

RSpec.describe StudentSectionAssignmentRow do
  describe '#build' do
    let(:student_section_assignment_row) { described_class.new(row) }
    let(:student_section_assignment) { student_section_assignment_row.build }

    context 'happy path' do
      let!(:course) { FactoryGirl.create(:course, course_number: 'F100') }
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:section) {
        FactoryGirl.create(:section, course: course, section_number: 'MUSIC-005')
      }

      let(:row) {
        {
          local_id: student.local_id,
          section_number: 'MUSIC-005',
          course_number: 'F100'
        }
      }

      it 'assigns the correct values' do
        expect(student_section_assignment.student).to eq(student)
        expect(student_section_assignment.section).to eq(section)
      end
    end

    context 'section with same section_number at different school' do
      let!(:school) { FactoryGirl.create(:school) }
      let!(:another_course) {
        FactoryGirl.create(:course, course_number: 'F100', school: school)
      }
      let!(:another_section) {
        FactoryGirl.create(:section, course: another_course, section_number: 'MUSIC-005')
      }

      let!(:course) { FactoryGirl.create(:course, course_number: 'F100') }
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:section) {
        FactoryGirl.create(:section, course: course, section_number: 'MUSIC-005')
      }

      let(:row) {
        {
          local_id: student.local_id,
          section_number: 'MUSIC-005',
          course_number: 'F100'
        }
      }

      it 'assigns the correct values' do
        expect(student_section_assignment.student).to eq(student)
        expect(student_section_assignment.section).to eq(section)
      end
    end

    context 'no course info' do
      let!(:section) { FactoryGirl.create(:section) }
      let!(:student) { FactoryGirl.create(:high_school_student) }
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
