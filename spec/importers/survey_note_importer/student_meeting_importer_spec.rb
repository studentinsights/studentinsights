require 'rails_helper'

RSpec.describe StudentMeetingImporter do
  describe 'integration test' do
    it 'works for importing notes' do
      pals = TestPals.create!
      importer = StudentMeetingImporter.new
      file_text = IO.read("#{Rails.root}/spec/importers/survey_note_importer/student_meeting_fixture.csv")
      survey, syncer = importer.import(file_text)

      expect(EventNote.pluck(:event_note_type_id, :is_restricted).uniq).to eq([[304, false]])
      expect(EventNote.all.as_json(only: [:student_id, :educator_id, :text])).to contain_exactly(*[
        {
          'student_id' => pals.shs_freshman_mari.id,
          'educator_id' => pals.shs_jodi.id,
          'text' => include("NGE/10GE/NEST Student Meeting\n\nWhat classes are you doing well in?\nFrench, Algebra and Pottery")
        }, {
          'student_id' => pals.shs_senior_kylo.id,
          'educator_id' => pals.shs_hugo_art_teacher.id,
          'text' => include("NGE/10GE/NEST Student Meeting\n\nWhat classes are you doing well in?\nEnglish, History, and Math")
        }
      ])
      expect(syncer.send(:stats)).to eq({
        :created_rows_count => 2,
        :destroyed_records_count => 0,
        :invalid_rows_count => 0,
        :marked_ids_count => 2,
        :passed_nil_record_count => 0,
        :unchanged_rows_count => 0,
        :updated_rows_count => 0,
        :validation_failure_counts_by_field => {},
      })
    end
  end
end
