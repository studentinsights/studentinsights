require 'rails_helper'

RSpec.describe BedfordDavisSocialEmotionalProcessor do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_social_emotional_fixture.csv")
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create!(skip_imported_forms: true) }

    it 'works for importing records' do
      counselor = FactoryBot.create(:educator, full_name: 'Brown, Natalie')
      log = LogHelper::FakeLog.new
      importer = BedfordDavisSocialEmotionalProcessor.new(pals.rich_districtwide, {
        log: log,
        time_now: pals.time_now
      })
      rows = importer.dry_run(fixture_file_text)

      records = rows.map {|row| EventNote.create!(row)} # to exercise validations
      expect(log.output).to include('processed_rows_count=>4')
      expect(records.size).to eq(3)
      expect(records.as_json({
        dangerously_include_restricted_text: true,
        except: [:id, :created_at, :updated_at]
      })).to eq([{
        "student_id"=>pals.shs_senior_kylo.id,
        "educator_id"=>counselor.id,
        "event_note_type_id"=>304,
        "text"=>"Social emotional services during 2018-2019\n- Soc.Emo. Check in w/ counselor\n\nNew to district this year, transition was a little tough but settled in now.",
        "recorded_at"=>pals.time_now.as_json,
        "is_restricted"=>true
      },{
        "student_id"=>pals.shs_freshman_amir.id,
        "educator_id"=>counselor.id,
        "event_note_type_id"=>304,
        "text"=>"Social emotional services during 2018-2019\n- Soc. Emo. Small group",
        "recorded_at"=>pals.time_now.as_json,
        "is_restricted"=>true
      },{
        "student_id"=>pals.west_eighth_ryan.id,
        "educator_id"=>pals.rich_districtwide.id,
        "event_note_type_id"=>304,
        "text"=>"Family medical issues this year, they took on a lot to support everyone at home",
        "recorded_at"=>pals.time_now.as_json,
        "is_restricted"=>true
      }])
    end
  end
end
