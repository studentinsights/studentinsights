require 'rails_helper'

RSpec.describe StudentVoiceMidYearImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/student_voice_surveys/student_voice_mid_year_survey_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works for importing notes' do
      log = LogHelper::FakeLog.new
      form_url = 'https://example.com/form_url'
      importer = StudentVoiceMidYearImporter.new(pals.shs_jodi.id, form_url, log: log)
      imported_forms = importer.create!(fixture_file_text)
      expect(ImportedForm.all.size).to eq 1
      expect(imported_forms.as_json(except: [:id, :created_at, :updated_at])).to contain_exactly(*[{
        'student_id' => pals.shs_freshman_mari.id,
        'form_timestamp' => Time.parse('2019-01-28 09:23:43.000000000 +0000'),
        'educator_id' => pals.shs_jodi.id,
        'form_key' => 'shs_what_i_want_my_teacher_to_know_mid_year',
        'responses_json' => {
          "What was the high point for you in school this year so far?"=>"A high point has been my grade in Biology since I had to work a lot for it",
          "I am proud that I..."=>"Have good grades in my classes",
          "My best qualities are..."=>"helping others when they don't know how to do homework assignments",
          "My activities and interests outside of school are..."=>"cheering",
          "I get nervous or stressed in school when..."=>"I get a low grade on an assignment that I thought I would do well on",
          "I learn best when my teachers..."=>"show me each step of what I have to do"
        }
      }])
      expect(log.output).to include('processed_rows_count=>1')
      expect(ImportedForm.where(student_id: pals.shs_freshman_mari.id).size).to eq 1
    end
  end
end
