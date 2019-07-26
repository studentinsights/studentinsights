# typed: false
require 'rails_helper'

RSpec.describe Q2SelfReflectionImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/student_voice_surveys/q2_self_reflection_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create!(skip_imported_forms: true) }

    it 'works for importing notes' do
      log = LogHelper::FakeLog.new
      form_url = 'https://example.com/form_url'
      importer = Q2SelfReflectionImporter.new(pals.shs_jodi.id, form_url, log: log)
      imported_forms = importer.create!(fixture_file_text)
      expect(ImportedForm.all.size).to eq 1
      expect(imported_forms.as_json(except: [:id, :created_at, :updated_at])).to contain_exactly(*[{
        'student_id' => pals.shs_freshman_mari.id,
        'educator_id' => pals.shs_jodi.id,
        'form_key' => ImportedForm::SHS_Q2_SELF_REFLECTION,
        'form_url' => 'https://example.com/form_url',
        'form_timestamp' => Time.parse('2019-01-29T14:01:24.000Z'),
        'form_json' => {
          "What classes are you doing well in?"=>"Computer Science, French",
          "Why are you doing well in those classes?"=>"I make time in my afternoon each day for doing homework and stick to it",
          "What courses are you struggling in?"=>"Nothing really",
          "Why are you struggling in those courses?"=>"I have to work really hard ",
          "In the classes that you are struggling in, how can your teachers support you so that your grades, experience, work load, etc, improve?"=>"Change the way homework works, it's too much",
          "When you are struggling, who do you go to for support, encouragement, advice, etc?"=>"Being able to stay after school and work with teachers when I need help",
          "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?"=>"Keeping grades high in all classes since I'm worried about college",
          "What other information is important for your teachers to know so that we can support you and your learning? (For example, tutor, mentor, before school HW help, study group, etc)"=>"Help in the morning before school"
        }
      }])
      expect(log.output).to include('processed_rows_count=>1')
      expect(ImportedForm.where(student_id: pals.shs_freshman_mari.id).size).to eq 1
    end
  end
end
