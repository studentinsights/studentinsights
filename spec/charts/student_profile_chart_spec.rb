require 'rails_helper'

RSpec.describe StudentProfileChart do

  describe 'to_highcharts_percentile_rank_series' do
    let(:student_assessment) { FactoryGirl.create(:star_math_warning_assessment) }
    let(:input) { [student_assessment] }
    let(:student_profile_chart) { StudentProfileChart.new }
    it 'converts the student assessment to highcharts format' do
      result = student_profile_chart.to_highcharts_percentile_rank_series(input)
      expect(result).to eq [[2015, 6, 19, 8]]
    end
  end
end
