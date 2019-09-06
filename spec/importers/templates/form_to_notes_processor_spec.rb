require 'rails_helper'

RSpec.describe FormToNotesProcessor do
  def narrow_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/templates/form_to_notes_fixture.csv")
  end

  def wide_fixture_file_text
    IO.read("#{Rails.root}/spec/importers/templates/form_to_notes_fixture_wide.csv")
  end

  def recorded_at_timestamp_file_text
    IO.read("#{Rails.root}/spec/importers/templates/form_to_notes_fixture_recorded_at_timestamp.csv")
  end

  def create_processor(options = {})
    log = LogHelper::FakeLog.new
    processor = FormToNotesProcessor.new(options.merge(log: log))
    [processor, log]
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works for wide forms with `Timestamp`' do
      processor, log = create_processor(time_now: pals.time_now)
      rows = processor.dry_run(wide_fixture_file_text)
      expect(rows).to eq([{
        :student_id=>pals.healey_kindergarten_student.id,
        :educator_id=>pals.healey_vivian_teacher.id,
        :is_restricted=>false,
        :text=> "Q: What would help this student thrive next year?\nFeeling comfortable with their new classroom at the start of the year\n\nQ: What are you most proud of about this student?\nSharing their artwork as part of a final project last year, they were nervous to get feedback on something they put so much work into.",
        :event_note_type_id=>303,
        :recorded_at=>Time.parse('Tue, 23 Jul 2016 20:06:32.000000000 +0000')
      }])
      expect(log.output).to include('processed_rows_count=>1')
    end

    it 'works for wide forms with `recorded_at timestamp`' do
      processor, log = create_processor(time_now: pals.time_now)
      rows = processor.dry_run(recorded_at_timestamp_file_text)

      expect(rows).to eq([{
        :student_id=>pals.healey_kindergarten_student.id,
        :educator_id=>pals.healey_vivian_teacher.id,
        :is_restricted=>false,
        :text=> "Q: What would help this student thrive next year?\nFeeling comfortable with their new classroom at the start of the year\n\nQ: What are you most proud of about this student?\nSharing their artwork as part of a final project last year, they were nervous to get feedback on something they put so much work into.",
        :event_note_type_id=>303,
        :recorded_at=>Time.parse('Tue, 23 Jul 2016 20:06:32.000000000 +0000')
      }])
      expect(log.output).to include('processed_rows_count=>1')
    end

    it 'works for narrow forms' do
      processor, log = create_processor(time_now: pals.time_now)
      rows = processor.dry_run(narrow_fixture_file_text)

      expect(rows).to eq([{
        :student_id=>pals.healey_kindergarten_student.id,
        :educator_id=>pals.healey_vivian_teacher.id,
        :is_restricted=>false,
        :text=> "Q: What would help this student thrive next year?\nFeeling comfortable with their new classroom at the start of the year\n\nQ: What are you most proud of about this student?\nSharing their artwork as part of a final project last year, they were nervous to get feedback on something they put so much work into.",
        :event_note_type_id=>304,
        :recorded_at=>pals.time_now
      }])
      expect(log.output).to include('processed_rows_count=>1')
    end
  end
end
