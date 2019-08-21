require 'rails_helper'

RSpec.describe RestrictedNotesFormProcessor do
  def wide_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/form_to_notes/form_to_notes_fixture_wide.csv")
  end

  def narrow_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/form_to_notes/restricted_notes_form_fixture.csv")
  end

  def create_processor(options = {})
    log = LogHelper::FakeLog.new
    processor = RestrictedNotesFormProcessor.new(options.merge(log: log))
    [processor, log]
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works for narrow forms' do
      processor, log = create_processor(time_now: pals.time_now)
      rows = processor.dry_run(narrow_fixture_file_text)

      expect(rows).to eq([{
        :student_id=>pals.healey_kindergarten_student.id,
        :educator_id=>pals.healey_vivian_teacher.id,
        :is_restricted=>true,
        :text=>"There was some communication last year with their pediatrician about medication.",
        :event_note_type_id=>304,
        :recorded_at=>pals.time_now
      }])
      expect(log.output).to include('processed_rows_count=>1')
    end
  end
end
