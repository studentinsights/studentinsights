require 'rails_helper'

RSpec.describe SomervilleMegaReadingImporter do
  let!(:pals) { TestPals.create! }

  def fixture_file_location
    "#{Rails.root}/spec/importers/reading/reading_fixture_csvs/"
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
      importer = SomervilleMegaReadingImporter.new(files_path: fixture_file_location)
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
