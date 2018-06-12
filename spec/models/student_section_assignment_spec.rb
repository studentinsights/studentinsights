require 'rails_helper'

RSpec.describe StudentSectionAssignment, type: :model do

  context 'valid course' do
    let(:student_section_assignment) { FactoryBot.build(:student_section_assignment)}

    it 'is valid' do
      expect(student_section_assignment).to be_valid
    end
  end
end
