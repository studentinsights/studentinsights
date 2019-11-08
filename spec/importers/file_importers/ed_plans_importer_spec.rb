require 'rails_helper'

RSpec.describe EdPlansImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/file_importers/ed_plans_fixture.csv")
  end

  def create_importer(options = {})
    log = LogHelper::FakeLog.new
    matcher = ImportMatcher.new
    importer = EdPlansImporter.new(options: {
      log: log,
      matcher: matcher,
      school_scope: nil,
      file_text: nil
    }.merge(options))
    [importer, matcher, log]
  end

  def mock_importer_download!(importer)
    mock_per_district = PerDistrict.new
    allow(PerDistrict).to receive(:new).and_return(mock_per_district)
    allow(mock_per_district).to receive(:try_sftp_filename).with('FILENAME_FOR_ED_PLAN_IMPORT').and_return('test_filename_for_ed_plan_import.csv')
    allow(importer).to receive(:download_csv_file_text).with('test_filename_for_ed_plan_import.csv').and_return(fixture_file_text)
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works on happy path, with SFTP download mocked' do
      importer, matcher, log = create_importer
      mock_importer_download!(importer)
      importer.import

      expect(log.output).to include(':created_rows_count=>2')
      expect(importer.instance_variable_get(:@syncer).stats[:created_rows_count]).to eq 2
      expect(matcher.stats).to include({
        :valid_rows_count => 2,
        :invalid_rows_count => 0
      })

      expect(EdPlan.all.size).to eq 2
      expect(EdPlan.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "sep_oid"=>"test-sep-oid-1",
        "student_id"=>pals.healey_kindergarten_student.id,
        "sep_status"=>"2",
        "sep_effective_date"=>Date.parse('Tue, 15 Sep 2015'),
        "sep_review_date"=>Date.parse('Thu, 15 Oct 2015'),
        "sep_last_meeting_date"=>nil,
        "sep_district_signed_date"=>nil,
        "sep_parent_signed_date"=>Date.parse('Tue, 15 Sep 2015'),
        "sep_end_date"=>Date.parse('Thu, 15 Oct 2015'),
        "sep_last_modified"=>Time.parse('2015-03-08 14:09:03.000000000 +0000'),
        "sep_fieldd_001"=>"",
        "sep_fieldd_002"=>"",
        "sep_fieldd_003"=>"",
        "sep_fieldd_004"=>"",
        "sep_fieldd_005"=>"Category",
        "sep_fieldd_006"=>"Health disability",
        "sep_fieldd_007"=>"Rich Districtwide, Laura Principal",
        "sep_fieldd_008"=>nil,
        "sep_fieldd_009"=>nil,
        "sep_fieldd_010"=>nil,
        "sep_fieldd_011"=>nil,
        "sep_fieldd_012"=>nil,
        "sep_fieldd_013"=>nil,
        "sep_fieldd_014"=>nil
      }, {
        "sep_oid"=>"test-sep-oid-2",
        "student_id"=>pals.west_eighth_ryan.id,
        "sep_status"=>"4",
        "sep_effective_date"=>Date.parse('Sun, 23 Aug 2015'),
        "sep_review_date"=>Date.parse('Fri, 02 Oct 2015'),
        "sep_last_meeting_date"=>nil,
        "sep_district_signed_date"=>nil,
        "sep_parent_signed_date"=>nil,
        "sep_end_date"=>Date.parse('Mon, 22 Feb 2016'),
        "sep_last_modified"=>Time.parse('2018-06-01 12:54:25.000000000 +0000'),
        "sep_fieldd_001"=>"",
        "sep_fieldd_002"=>"",
        "sep_fieldd_003"=>"",
        "sep_fieldd_004"=>"",
        "sep_fieldd_005"=>"",
        "sep_fieldd_006"=>"ADHD\\\nGeneral Anxiety Disorder",
        "sep_fieldd_007"=>"Ryan Rodriguez (student), Marcus Counselor (counselor)",
        "sep_fieldd_008"=>nil,
        "sep_fieldd_009"=>nil,
        "sep_fieldd_010"=>nil,
        "sep_fieldd_011"=>nil,
        "sep_fieldd_012"=>nil,
        "sep_fieldd_013"=>nil,
        "sep_fieldd_014"=>nil
      }])
    end
  end
end
