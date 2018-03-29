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

  describe '#chart_data' do
    let(:student) { FactoryGirl.create(:student) }
    it 'has the expected keys' do
      chart_data = StudentProfileChart.new(student).chart_data
      expect(chart_data.keys).to match_array([
        :star_series_math_percentile,
        :star_series_reading_percentile,
        :next_gen_mcas_mathematics_scaled,
        :next_gen_mcas_ela_scaled,
        :mcas_series_math_scaled,
        :mcas_series_ela_scaled,
        :mcas_series_math_growth,
        :mcas_series_ela_growth,
        :interventions
      ])
    end
  end
end
