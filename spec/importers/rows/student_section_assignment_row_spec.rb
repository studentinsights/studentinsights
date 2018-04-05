require 'rails_helper'

RSpec.describe StudentSectionAssignmentRow do
  describe '#build' do
    before { School.seed_somerville_schools }
    let(:dictionary) {
      School.all.map { |school| [school.local_id, school.id] }.to_h
    }

    let(:student_section_assignment_row) { described_class.new(row, dictionary) }
    let(:student_section_assignment) { student_section_assignment_row.build }
    let(:healey_school) { School.find_by_local_id('HEA') }
    let(:brown_school) { School.find_by_local_id('BRN') }

    context 'happy path' do
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:course) {
        FactoryGirl.create(
          :course, course_number: 'F100', school: healey_school
        )
      }
      let!(:section) {
        FactoryGirl.create(
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
        FactoryGirl.create(:course, course_number: 'F100', school: brown_school)
      }
      let!(:another_section) {
        FactoryGirl.create(
          :section, course: another_course, section_number: 'MUSIC-005', term_local_id: 'FY'
        )
      }

      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:course) {
        FactoryGirl.create(:course, course_number: 'F100', school: healey_school)
      }
      let!(:section) {
        FactoryGirl.create(
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
