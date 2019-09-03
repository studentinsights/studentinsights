require 'rails_helper'

RSpec.describe StudentVoiceSurveyUploader do
  let!(:pals) { TestPals.create! }

  def create_test_uploader(options = {})
    log = LogHelper::FakeLog.new
    file_text = IO.read("#{Rails.root}/spec/fixtures/student_voice_survey_v2.csv")
    upload_attrs = {
      file_name: 'foo-file-name',
      uploaded_by_educator_id: pals.shs_jodi.id
    }
    importer = StudentVoiceSurveyUploader.new(file_text, upload_attrs, {
      log: log,
      time_now: pals.time_now
    }.merge(options))

    [importer, log]
  end

  context '#read_student_lasid_from_row' do
    def unit_test_data(log, text)
      csv = StreamingCsvTransformer.from_text(log, text)
      raw_rows = []
      csv.each_with_index {|row, index| raw_rows << row }
      raw_row = raw_rows.first
      row_attrs = {
        student_lasid: '111222222'
      }

      [raw_row, row_attrs]
    end

    it 'reads from email address if it is there' do
      uploader, log = create_test_uploader()
      text = "Email Address,Local ID number\n111222222@demo.studentinsights.org,typo"
      raw_row, row_attrs = unit_test_data(log, text)
      expect(uploader.send(:read_student_lasid_from_row, raw_row, row_attrs)).to eq '111222222'
    end

    it 'can fall back to student local id' do
      uploader, log = create_test_uploader()
      text = "Email Address,Local ID number\n,111222222"
      raw_row, row_attrs = unit_test_data(log, text)
      expect(uploader.send(:read_student_lasid_from_row, raw_row, row_attrs)).to eq '111222222'
    end
  end
end
