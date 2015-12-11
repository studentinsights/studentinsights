require 'rails_helper'

RSpec.describe StudentProfileChart do

  describe 'percentile_ranks_to_highcharts' do
    let(:student_assessment) { FactoryGirl.create(:star_math_warning_assessment) }
    let(:input) { [student_assessment] }
    let(:student_profile_chart) { StudentProfileChart.new }
    it 'converts the student assessment to highcharts format' do
      result = student_profile_chart.percentile_ranks_to_highcharts(input)
      expect(result).to eq [[2015, 6, 19, 8]]
    end
  end
end
