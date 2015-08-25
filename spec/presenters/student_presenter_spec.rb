require 'rails_helper'

RSpec.describe StudentPresenter do

  let(:student_without_attributes) { FactoryGirl.create(:student) }
  let(:student_with_full_name) { FactoryGirl.create(:student_with_full_name) }
  let(:sped_student) { FactoryGirl.create(:sped_student) }

  describe '#full_name' do
    context 'has a first and last name' do
      it 'presents the full name' do
        presenter = StudentPresenter.new student_with_full_name
        expect(presenter.full_name).to eq student_with_full_name.first_name + " " + student_with_full_name.last_name
      end
    end
  end
  describe '#sped' do
    context 'belongs to Sped Program' do
      it 'presents the program assigned' do
        presenter = StudentPresenter.new(sped_student)
        expect(presenter.program_assigned).to eq "Sp Ed"
      end
    end
    context 'does not have a program assigned' do
      it 'presents N/A' do
        presenter = StudentPresenter.new(student_without_attributes)
        expect(presenter.sped_placement).to eq "—"
      end
    end
  end
end
