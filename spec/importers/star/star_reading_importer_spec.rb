require 'rails_helper'

RSpec.describe StarReadingImporter do
  def create_mocked_importer(district_key, local_fixture_filename, options = {})
    mock_for_fixture!(district_key, local_fixture_filename)
    log = LogHelper::FakeLog.new
    importer = StarReadingImporter.new(options: {
      school_scope: nil,
      log: log
    }.merge(options))
    [importer, log]
  end

  def mock_for_fixture!(district_key, local_fixture_filename)
    # mock config
    mock_per_district = PerDistrict.new(district_key: district_key)
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
    let!(:pals) { TestPals.create! }
    let!(:student) { FactoryBot.create(:student, local_id: '10', school: pals.west) }

    it 'works for v2 format in somerville' do
      Timecop.freeze(pals.time_now) do
        importer, log = create_mocked_importer(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_reading_v2.csv")
        importer.import
        expect(log.output).to include(':processed_rows_count=>1')
        expect(StarReadingResult.all.size).to eq(1)
        expect(StarReadingResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
          "date_taken"=>DateTime.new(2015, 1, 21, 13, 18, 27), # parsed as EDT/EST, stored in UTC
          "percentile_rank"=>90,
          "total_time"=>710,
          "grade_equivalent"=>"1.00",
          "student_id"=>student.id
        })
      end
    end

    it 'works for v1 format in new bedford' do
      Timecop.freeze(pals.time_now) do
        importer, log = create_mocked_importer(PerDistrict::NEW_BEDFORD, "#{Rails.root}/spec/importers/star/star_reading_v1.csv")
        importer.import
        expect(log.output).to include(':processed_rows_count=>1')
        expect(StarReadingResult.all.size).to eq(1)
        expect(StarReadingResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
          "date_taken"=>DateTime.new(2015, 1, 21, 13, 18, 27), # parsed as EDT/EST, stored in UTC
          "percentile_rank"=>90,
          "total_time"=>710,
          "grade_equivalent"=>"1.00",
          "student_id"=>student.id
        })
      end
    end

    it 'skips and logs bad data (v2 as example)' do
      importer, log = create_mocked_importer(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_reading_v2_invalid.csv")
      importer.import
      expect(log.output).to include('error: ["Percentile rank too high"]')
      expect(log.output).to include('skipped 1 invalid rows')
      expect(StarReadingResult.all.size).to eq(0)
    end

    it 'supports school filter (v2 as example)' do
      importer, log = create_mocked_importer(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_reading_v2.csv", {
        school_scope: ['SHS']
      })
      importer.import
      expect(log.output).to include('skipped 1 rows because of school filter')
      expect(StarReadingResult.all.size).to eq(0)
    end
  end

  it 'logs and aborts when config not set (eg, in Bedford)' do
    mock_per_district = PerDistrict.new(district_key: 'bedford')
    allow(mock_per_district).to receive(:try_star_filename).and_return(nil)
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)

    log = LogHelper::FakeLog.new
    importer = StarReadingImporter.new(options: {
      school_scope: nil,
      log: log
    })
    importer.import
    expect(log.output).to include 'Aborting, no remote_file_name'
  end
end
