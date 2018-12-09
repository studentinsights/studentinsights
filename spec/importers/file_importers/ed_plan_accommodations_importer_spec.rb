require 'rails_helper'

RSpec.describe EdPlanAccommodationsImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/file_importers/ed_plan_accommodations_fixture.csv")
  end

  def create_importer(options = {})
    log = LogHelper::FakeLog.new
    matcher = ImportMatcher.new
    importer = EdPlanAccommodationsImporter.new(options: {
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
    allow(mock_per_district).to receive(:try_sftp_filename).with('FILENAME_FOR_ED_PLAN_ACCOMMODATIONS_IMPORT').and_return('test.txt')
    allow(importer).to receive(:download_csv_file_text).with('test.txt').and_return(fixture_file_text)
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works on happy path, when ed plan has already been imported' do
      ed_plan = EdPlan.create!({
        sep_oid: 'test-sep-oid-1',
        student_id: pals.healey_kindergarten_student.id
      })
      importer, matcher, log = create_importer
      mock_importer_download!(importer)
      importer.import

      expect(log.output).to include(':created_rows_count=>1')
      expect(importer.instance_variable_get(:@syncer).stats[:created_rows_count]).to eq 1
      expect(matcher.stats).to eq({
        valid_rows_count: 1,
        invalid_rows_count: 0,
        invalid_sep_oids: [],
        invalid_course_numbers: [],
        invalid_educator_emails: [],
        invalid_student_local_ids: []
      })

      expect(EdPlanAccommodation.all.size).to eq 1
      expect(EdPlanAccommodation.all.as_json(except: [:id, :created_at, :updated_at])).to eq([{
        "ed_plan_id"=>ed_plan.id,
        "iac_oid"=>"test-iac-oid-101",
        "iac_sep_oid"=>"test-sep-oid-1",
        "iac_content_area"=>"All",
        "iac_category"=>"Non-standard",
        "iac_type"=>"504",
        "iac_description"=>"Student will meet with teachers before or after school to find out about any make-up work.",
        "iac_field"=>"Student, teachers",
        "iac_name"=>"Other Non-Standard Accommodation",
        "iac_last_modified"=>Time.parse('2016-02-02 12:34:28.000000000 +0000')
      }])
    end

    it 'skips when no ed plan to match with' do
      importer, matcher, log = create_importer
      mock_importer_download!(importer)
      importer.import

      expect(log.output).to include('@invalid_ed_plan_key: 1')
      expect(matcher.stats[:invalid_sep_oids]).to eq ['test-sep-oid-1']
      expect(EdPlanAccommodation.all.size).to eq 0
    end
  end
end
