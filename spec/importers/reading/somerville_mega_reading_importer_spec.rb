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

  describe 'integration test' do
    it 'works on happy path' do
      pluto, donald = create_students!
      ENV['READING_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = "uri"
      importer = SomervilleMegaReadingImporter.new(pals.uri.id, files_path: fixture_file_location)
      importer.import
      puts ReadingBenchmarkDataPoint.all.to_json
    end
  end


end
