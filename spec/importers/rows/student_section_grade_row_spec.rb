require 'rails_helper'

RSpec.describe StudentSectionGradeRow do
  describe '#build' do
    context 'happy path' do
      let!(:section) { FactoryGirl.create(:section) }
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:ssa) do
        FactoryGirl.create(:student_section_assignment,
                           student: student,
                           section: section)
      end
      let(:student_lasid_map) { Hash[student.local_id, student.id] }
      let(:section_number_map) { Hash[section.section_number, section.id]}
      let(:student_section_grade_row) { described_class.new(row,student_lasid_map,section_number_map) }
      let(:student_section_assignment) { student_section_grade_row.build }
      let(:row) do
        { section_number: section.section_number,
          student_local_id: student.local_id,
          school_local_id: 'SHS',
          course_number: section.course_number,
          term_local_id: 'FY',
          grade: 85 }
      end

      it 'assigns info correctly' do
        expect(student_section_assignment.grade).to eq 85
      end
    end
  end
end
