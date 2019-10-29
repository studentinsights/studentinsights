require 'rails_helper'

RSpec.describe StarReadingImporter do
  def create_mocked_importer(local_fixture_filename)
    mock_for_fixture!(local_fixture_filename)
    log = LogHelper::FakeLog.new
    importer = StarReadingImporter.new(options: {
      school_scope: nil,
      log: log
    })
    [importer, log]
  end

  def mock_for_fixture!(local_fixture_filename)
    # mock config
    mock_per_district = PerDistrict.new
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_READING_IMPORT').and_return('file.csv')
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_ZIP_FILE').and_return('star.zip')    
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)
    
    # zip fixture
    zipped_fixture = Tempfile.new('zipped').tap do |zip|
      Zip::File.open(zip, Zip::File::CREATE) do |zipfile|
        zipfile.add('file.csv', local_fixture_filename)
      end
    end

    # mock zip download
    mock_client = SftpClient.new
    allow(mock_client).to receive(:download_file).with('star.zip').and_return(zipped_fixture)
    allow(SftpClient).to receive(:for_star).and_return(mock_client)
    nil
  end

  describe '#import' do
    let!(:student) { FactoryBot.create(:student, local_id: '10') }
    
    it 'works' do
      importer, log = create_mocked_importer("#{Rails.root}/spec/importers/star/fake_star_reading.csv")
      importer.import
      expect(log.output).to include(':processed_rows_count=>1')
      expect(StarReadingResult.all.size).to eq(1)
      expect(StarReadingResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
        "date_taken"=>DateTime.new(2015, 1, 21, 14, 18, 27), # stored in UTC
        "percentile_rank"=>90,
        "total_time"=>710,
        "grade_equivalent"=>"1.00",
        "student_id"=>student.id
      })
    end

    it 'tolerates bad data' do
      importer, log = create_mocked_importer("#{Rails.root}/spec/importers/star/bad_star_reading_data.csv")
      importer.import
      expect(log.output).to include('error: ["Percentile rank too high"]')
      expect(log.output).to include('skipped 1 invalid rows')
      expect(StarReadingResult.all.size).to eq(0)
    end
  end
end
