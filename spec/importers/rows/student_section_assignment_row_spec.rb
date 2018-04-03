require 'rails_helper'

RSpec.describe StudentSectionAssignmentRow do

  describe '#build' do

    let(:student_section_assignment_row) { described_class.new(row) }
    let(:student_section_assignment) { student_section_assignment_row.build }

    context 'happy path' do
      let!(:section) { FactoryGirl.create(:section) }
      let!(:student) { FactoryGirl.create(:high_school_student) }
      let(:row) { { local_id: student.local_id,
                    section_number: section.section_number,
                } }

      it 'assigns info correctly' do
        expect(student_section_assignment.student).to eq student
        expect(student_section_assignment.section).to eq section
      end
    end
  end
end
