require 'rails_helper'

RSpec.describe StarMathImporter do
  def create_mocked_importer(district_key, local_fixture_filename)
    mock_for_fixture!(district_key, local_fixture_filename)
    log = LogHelper::FakeLog.new
    importer = StarMathImporter.new(options: {
      school_scope: nil,
      log: log
    })
    [importer, log]
  end

  def mock_for_fixture!(district_key, local_fixture_filename)
    # mock config
    mock_per_district = PerDistrict.new(district_key: district_key)
    allow(mock_per_district).to receive(:try_star_filename).with('FILENAME_FOR_STAR_MATH_IMPORT').and_return('file.csv')
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

    it 'works for v2 in somerville' do
      importer, log = create_mocked_importer(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_math_v2.csv")
      importer.import
      expect(log.output).to include(':processed_rows_count=>1')
      expect(StarMathResult.all.size).to eq(1)
      expect(StarMathResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
        "date_taken"=>DateTime.new(2015, 1, 21, 14, 18, 27), # stored in UTC
        "percentile_rank"=>70,
        "total_time"=>600,
        "grade_equivalent"=>"1.00",
        "student_id"=>student.id
      })
    end

    it 'works for v1 in new_bedford' do
      importer, log = create_mocked_importer(PerDistrict::NEW_BEDFORD, "#{Rails.root}/spec/importers/star/star_math_v1.csv")
      importer.import
      expect(log.output).to include(':processed_rows_count=>1')
      expect(StarMathResult.all.size).to eq(1)
      expect(StarMathResult.first.as_json(except: [:id, :created_at, :updated_at])).to eq({
        "date_taken"=>DateTime.new(2015, 1, 21, 14, 18, 27), # stored in UTC
        "percentile_rank"=>70,
        "total_time"=>600,
        "grade_equivalent"=>"1.00",
        "student_id"=>student.id
      })
    end

    it 'handles bad data (v2 as example)' do
      importer, log = create_mocked_importer(PerDistrict::SOMERVILLE, "#{Rails.root}/spec/importers/star/star_math_v2_invalid.csv")
      importer.import
      expect(log.output).to include('error: ["Percentile rank can\'t be blank"]')
      expect(log.output).to include('skipped 1 invalid rows')
      expect(StarMathResult.all.size).to eq(0)
    end
  end
end
