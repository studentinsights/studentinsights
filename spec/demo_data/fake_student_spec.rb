require 'rails_helper'

RSpec.describe FakeStudent do

  let!(:school) { FactoryGirl.create(:school) }
  let!(:homeroom) { FactoryGirl.create(:homeroom) }
  before { FactoryGirl.create(:educator, :admin) }
  let(:student) { described_class.new(homeroom).student }

  it 'sets student name' do
    expect(student.first_name).not_to be_nil
    expect(student.last_name).not_to be_nil
  end

  it 'sets student language attributes' do
    expect(student.limited_english_proficiency).not_to be_nil
    expect(student.home_language).not_to be_nil
  end

  it 'adds student assessments' do
    expect(student.student_assessments).not_to be_empty
  end

end
