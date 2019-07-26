# typed: false
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

    it 'filters assessments with null SGP' do
      FactoryBot.create(:student_assessment, {
        student: student,
        scale_score: 504,
        growth_percentile: 26,
        assessment: Assessment.find_by(family: 'Next Gen MCAS', subject: 'Mathematics')
      })
      FactoryBot.create(:student_assessment, {
        student: student,
        scale_score: 502,
        growth_percentile: nil,
        assessment: Assessment.find_by(family: 'Next Gen MCAS', subject: 'ELA')
      })

      expect(StudentProfileChart.new(student).chart_data.as_json).to eq({
        'next_gen_mcas_ela_scaled' => [[2015, 6, 19, 502]],
        'next_gen_mcas_mathematics_scaled' => [[2015, 6, 19, 504]],
        'mcas_series_ela_scaled' => nil,
        'mcas_series_math_scaled' => nil,
        'star_series_math_percentile' => [],
        'star_series_reading_percentile' => [],
        'interventions' => nil,
        'mcas_series_math_growth' => [[2015, 6, 19, 26]],
        'mcas_series_ela_growth' => []
      })
    end
  end
end
