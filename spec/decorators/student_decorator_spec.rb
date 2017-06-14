require 'rails_helper'

describe StudentDecorator do

  let(:student_without_attributes) { FactoryGirl.create(:student).decorate}
  let(:student_with_full_name) { FactoryGirl.create(:student_with_full_name).decorate }
  let(:sped_student) { FactoryGirl.create(:sped_student).decorate }

  describe '#full_name' do
    context 'has a first and last name' do
      it 'presents the full name' do
        expect(student_with_full_name.full_name).to eq student_with_full_name.first_name + " " + student_with_full_name.last_name
      end
    end
  end
  describe '#sped' do
    context 'belongs to Sped Program' do
      it 'presents the program assigned' do
        expect(sped_student.program_assigned).to eq "Sp Ed"
      end
    end
    context 'does not have a program assigned' do
      it 'presents N/A' do
        expect(student_without_attributes.sped_placement).to eq "—"
      end
    end
  end

end
