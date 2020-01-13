require 'rails_helper'

RSpec.describe StarMathImporter do
  def create_test_importer!(options = {})
    log = LogHelper::FakeLog.new
    importer = StarMathImporter.new(options: {
      school_scope: nil,
      log: log
    }.merge(options))
    [importer, log]
  end

  # config read from two places
  def mock_sis_sftp!(district_key, local_fixture_filename)
    mock_per_district = PerDistrict.new(district_key: district_key)
    allow(mock_per_district).to receive(:try_sftp_filename).with('FILENAME_FOR_STAR_ZIP_FILE').and_return('star.zip')
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_MATH_IMPORT').and_return('file.csv')
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)

    mock_sftp_connection!(:for_x2, local_fixture_filename)
  end

  def mock_star_sftp!(district_key, local_fixture_filename)
    mock_per_district = PerDistrict.new(district_key: district_key)
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_ZIP_FILE').and_return('star.zip')
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_MATH_IMPORT').and_return('file.csv')
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)

    mock_sftp_connection!(:for_star, local_fixture_filename)
  end

  # mock connection and zip download
  def mock_sftp_connection!(method_name, local_fixture_filename)
    zipped_fixture = Tempfile.new('zipped').tap do |zip|
      Zip::File.open(zip, Zip::File::CREATE) do |zipfile|
        zipfile.add('file.csv', local_fixture_filename)
      end
    end

    mock_client = SftpClient.new
    allow(mock_client).to receive(:download_file).with('star.zip').and_return(zipped_fixture)
    allow(SftpClient).to receive(method_name).and_return(mock_client)
    nil
  end

  describe '#import' do
    let!(:pals) { TestPals.create! }
    let!(:student) { FactoryBot.create(:student, local_id: '10', school: pals.west) }

    it 'works for v2 in somerville' do
      Timecop.freeze(pals.time_now) do
        mock_star_sftp!(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_math_v2.csv")
        importer, log = create_test_importer!()
        importer.import
        expect(log.output).to include(':processed_rows_count=>1')
        expect(StarMathResult.all.size).to eq(1)
        expect(StarMathResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
          "date_taken"=>'2015-01-21T13:18:27.000Z', # parsed as EDT/EST, stored in UTC
          "percentile_rank"=>70,
          "total_time"=>600,
          "grade_equivalent"=>"1.00",
          "student_id"=>student.id
        })
      end
    end

    it 'when new_bedford is enabled, it works for v1, via SFTP box for SIS' do
      Timecop.freeze(pals.time_now) do
        mock_sis_sftp!(PerDistrict::NEW_BEDFORD, "#{Rails.root}/spec/importers/star/star_math_v1.csv")
        # mock that new_bedford is enabled, to exercise this test code
        # even if it has been temporarily disabled
        allow(PerDistrict.new).to receive(:is_star_import_enabled).and_return(true)

        importer, log = create_test_importer!()
        importer.import
        expect(log.output).to include(':processed_rows_count=>1')
        expect(StarMathResult.all.size).to eq(1)
        expect(StarMathResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
          "date_taken"=>'2015-01-21T13:18:27.000Z', # parsed as EDT/EST, stored in UTC
          "percentile_rank"=>70,
          "total_time"=>600,
          "grade_equivalent"=>"1.00",
          "student_id"=>student.id
        })
      end
    end

    it 'handles bad data (v2 as example)' do
      mock_star_sftp!(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_math_v2_invalid.csv")
      importer, log = create_test_importer!()
      importer.import
      expect(log.output).to include('errors.keys: [:percentile_rank]')
      expect(log.output).to include('skipped 1 invalid rows')
      expect(StarMathResult.all.size).to eq(0)
    end

    it 'supports school filter (v2 as example)' do
      mock_star_sftp!(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_math_v2.csv")
      importer, log = create_test_importer!({
        school_scope: ['SHS']
      })
      importer.import
      expect(log.output).to include('skipped 1 rows because of school filter')
      expect(StarMathResult.all.size).to eq(0)
    end

    it 'logs and aborts when not enabled (eg, in Bedford)' do
      mock_per_district = PerDistrict.new(district_key: 'bedford')
      allow(mock_per_district).to receive(:try_star_filename).and_return(nil)
      allow(PerDistrict).to receive(:new).and_return(mock_per_district)

      log = LogHelper::FakeLog.new
      importer = StarMathImporter.new(options: {
        school_scope: nil,
        log: log
      })
      importer.import
      expect(log.output).to include 'Aborting, is_star_import_enabled=false'
    end
  end
end
