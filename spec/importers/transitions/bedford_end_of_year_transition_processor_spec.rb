require 'rails_helper'

RSpec.describe BedfordEndOfYearTransitionProcessor do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_end_of_year_transition_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create!(skip_imported_forms: true) }

    it 'works for importing notes' do
      log = LogHelper::FakeLog.new
      form_url = 'https://example.com/form_url'
      importer = BedfordEndOfYearTransitionProcessor.new(pals.healey_vivian_teacher, pals.healey_vivian_teacher.homeroom, form_url, {
        log: log,
        time_now: pals.time_now
      })
      imported_forms = importer.create!(fixture_file_text)
      expect(ImportedForm.all.size).to eq 1

      expect(imported_forms.as_json(except: [:id, :created_at, :updated_at]).first).to eq({
        'student_id' => pals.healey_kindergarten_student.id,
        'educator_id' => pals.healey_vivian_teacher.id,
        'form_key' => ImportedForm::BEDFORD_END_OF_YEAR_TRANSITION_FORM,
        'form_url' => 'https://example.com/form_url',
        'form_timestamp' => pals.time_now,
        "form_json"=>{
          "LLI"=>true,
          "Reading Intervention (w/ specialist)"=>false,
          "Math Intervention (w/ consult from SD)"=>true,
          "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy"=>"Nov- Dec: 3x30 1:4 pull out Reading group (PA and fundations)",
          "Is there any key information that you wish you knew about this student in September?"=>nil,
          "Please share anything that helped you connect with this student that might be helpful to the next teacher."=>nil
        }
      })
      expect(log.output).to include('processed_rows_count=>1')
      expect(ImportedForm.where({
        student_id: pals.healey_kindergarten_student.id,
        educator_id: pals.healey_vivian_teacher.id
      }).size).to eq 1
    end
  end
end
