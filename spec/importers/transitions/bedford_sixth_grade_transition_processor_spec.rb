require 'rails_helper'

RSpec.describe BedfordSixthGradeTransitionProcessor do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_sixth_grade_transition_processor_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create!(skip_imported_forms: true) }

    it 'works for importing records' do
      rising_fifth_grader = FactoryBot.create(:student, {
        grade: '5',
        school: pals.healey,
        local_id: '111999777'
      })
      log = LogHelper::FakeLog.new
      form_url = 'https://example.com/form_url'
      importer = BedfordSixthGradeTransitionProcessor.new(pals.healey_laura_principal.id, form_url, {
        log: log,
        time_now: pals.time_now
      })
      imported_forms = importer.create!(fixture_file_text)
      expect(ImportedForm.all.size).to eq 1

      expect(imported_forms.as_json(except: [:id, :created_at, :updated_at]).first).to eq({
        'student_id' => rising_fifth_grader.id,
        'educator_id' => pals.healey_laura_principal.id,
        'form_key' => 'bedford_sixth_grade_transition_form',
        'form_url' => 'https://example.com/form_url',
        'form_timestamp' => '2017-05-28T15:17:48.000Z',
        "form_json" => {
          "My interests and activities outside of school are..."=>"lacrosse, karate and violin",
          "Thinking back on last year, I am proud that I..."=>"learned a lot more than i expected in math this year"
        }
      })
      expect(log.output).to include('processed_rows_count=>1')
      expect(ImportedForm.where({
        student_id: rising_fifth_grader.id,
        educator_id: pals.healey_laura_principal.id
      }).size).to eq 1
    end
  end
end
