RSpec.describe StudentProfileChart do

  describe '#chart_data' do
    let(:student) { FactoryBot.create(:student) }
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
