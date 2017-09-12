require 'rails_helper'

RSpec.describe Section, type: :model do

  context 'valid section' do
    let(:course_description) { 'random description' }
    let(:course_number) { 'RND' }
    let(:course) { FactoryGirl.build(:course, course_number: course_number, course_description:course_description)}
    let(:section) { FactoryGirl.build(:section, course: course) }
    it 'is valid' do
      expect(section).to be_valid
    end

    it 'properly identifies parent course number' do
      expect(section.course_number).to eq(course_number)
    end

    it 'properly identifies parent course description' do
      expect(section.course_description).to eq(course_description)
    end
  end
end
