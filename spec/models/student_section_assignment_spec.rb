require 'rails_helper'

RSpec.describe StudentSectionAssignment, type: :model do

  context 'valid course' do
    it 'is valid' do
      student_section_assignment = FactoryBot.create(:student_section_assignment)
      expect(student_section_assignment).to be_valid
    end
  end
end
