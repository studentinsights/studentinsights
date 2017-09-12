require 'rails_helper'

RSpec.describe StudentSectionGradeRow do

  describe '#build' do

    let(:student_section_grade_row) { described_class.new(row) }
    let(:student_section_assignment) { student_section_grade_row.build }

    context 'happy path' do
      let!(:section) { FactoryGirl.create(:section) }
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let!(:ssa) { FactoryGirl.create(:student_section_assignment,
                                      student: student,
                                      section: section) }
      let(:row) { { section_number:section.section_number,
                    student_local_id:student.local_id, 
                    school_local_id: 'SHS',
                    course_number:section.course_number, 
                    term_local_id:'FY',
                    grade:85
                } }

      it 'assigns info correctly' do
        expect(student_section_assignment.grade).to eq 85
      end
    end
  end
end