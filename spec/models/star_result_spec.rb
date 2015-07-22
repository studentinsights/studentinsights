require 'rails_helper'

RSpec.describe StarResult, :type => :model do
  describe '#assign_to_school_year' do
    context 'has date taken' do
      let(:star_result) { FactoryGirl.create(:star_result) }
      it 'assigns the school year correctly' do
        expect(star_result.school_year).to eq(SchoolYear.find_by_name("2014-2015"))
      end
    end
    context 'does not have date taken' do
      let(:star_result) { FactoryGirl.create(:star_result_without_date_taken) }
      it 'raises an error' do
        expect { star_result.save }.to raise_error NoMethodError
      end
    end
  end
  describe '#reading_level_warning?' do
    context 'STAR result with reading warning' do
      let(:student) { FactoryGirl.create(:student_behind_in_reading) }
      it 'returns a warning' do
        star_result = student.star_results.last
        expect(star_result.reading_level_warning?).to be true
      end
    end
    context 'STAR result with without reading warning' do
      let(:student) { FactoryGirl.create(:student_ahead_in_reading) }
      it 'does not return a warning' do
        star_result = student.star_results.last
        expect(star_result.reading_level_warning?).to be false
      end
    end
  end
end
