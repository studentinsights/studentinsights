require 'rails_helper'

RSpec.describe SomervilleMegaReadingImporter do
  let!(:pals) { TestPals.create! }

  def create_mock_fetcher_from_map(folder_id_to_tab_map)
    mock_fetcher = GoogleSheetsFetcher.new
    allow(GoogleSheetsFetcher).to receive(:new).and_return(mock_fetcher)
    folder_id_to_tab_map.each do |folder_id, tabs|
      allow(mock_fetcher).to receive(:get_tabs_from_folder).with(folder_id).and_return(tabs)
    end
    mock_fetcher
  end

  def create_mock_fetcher
    create_mock_fetcher_from_map({
      'mock_folder_id_A' => [GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: '9999999999',
        spreadsheet_name: 'dev SPS Reading Benchmarks',
        spreadsheet_url: 'https://example.com/reading-benchmarks',
        tab_id: 'K',
        tab_name: 'Kindergarten',
        tab_csv: IO.read("#{Rails.root}/spec/importers/reading/mega_reading_processor_fixture.csv")
      })]
    })
  end

  def create_students!
    pluto = Student.create!(
      first_name: 'Pluto',
      last_name: 'Skywalker', # even if name in file doesn't exactly match insights
      school: pals.healey,
      grade: 'KF',
      local_id: '1111119992',
      enrollment_status: 'Active'
    )
    donald = Student.create!(
      first_name: 'Donald',
      last_name: 'Skywalker',
      school: pals.healey,
      grade: 'KF',
      local_id: '1111119993',
      enrollment_status: 'Active'
    )
    [pluto, donald]
  end

  describe 'import events' do
    it 'imports a csv' do
      pluto, donald = create_students!
      ENV['READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = "uri"
      ENV['IMPORTED_GOOGLE_FOLDER_IDS_JSON'] = '{"reading_benchmarks_folder_id":"mock_folder_id_A"}'
      importer = SomervilleMegaReadingImporter.new(options: {
        fetcher: create_mock_fetcher,
        school_year: 2019,
      })
      importer.import

      expect(ReadingBenchmarkDataPoint.where(
        student_id: pluto.id
      ).size).to eq(14)
      expect(ReadingBenchmarkDataPoint.where(
        student_id: donald.id
      ).size).to eq(14)

      expect(ReadingBenchmarkDataPoint.where(
          student_id: pluto.id,
          benchmark_period_key: "winter",
          benchmark_assessment_key: "dibels_fsf"
        ).size).to eq(1)

      expect(ReadingBenchmarkDataPoint.where(
          student_id: pluto.id,
          benchmark_period_key: "winter",
          benchmark_assessment_key: "dibels_fsf"
        ).first.json["value"]).to eq("25")

      expect(ReadingBenchmarkDataPoint.where(
          student_id: donald.id,
          benchmark_period_key: "spring",
          benchmark_assessment_key: "f_and_p_spanish"
        ).size).to eq(1)

      expect(ReadingBenchmarkDataPoint.where(
          student_id: pluto.id,
          benchmark_period_key: "spring",
          benchmark_assessment_key: "f_and_p_spanish"
        ).first.json["value"]).to eq("AA")
    end
  end
end
