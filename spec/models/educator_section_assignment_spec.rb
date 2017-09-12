require 'rails_helper'

RSpec.describe EducatorSectionAssignment, type: :model do

  context 'valid course' do
    let(:educator_section_assignment) { FactoryGirl.build(:educator_section_assignment)}

    it 'is valid' do
      expect(educator_section_assignment).to be_valid
    end
  end
end
