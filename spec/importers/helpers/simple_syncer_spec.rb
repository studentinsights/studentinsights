require 'rails_helper'

RSpec.describe SimpleSyncer do
  let!(:pals) { TestPals.create! }

  def make_log
    LogHelper::FakeLog.new
  end

  describe '#sync_and_delete_unmarked!' do
    it 'works on happy path' do
      # one record already exists from TestPals
      form_key = ImportedForm::BEDFORD_END_OF_YEAR_TRANSITION_FORM
      record = ImportedForm.new({
        student_id: pals.healey_kindergarten_student.id,
        educator_id: pals.healey_vivian_teacher.id,
        form_timestamp: pals.time_now - 4.days,
        form_key: form_key,
        form_url: 'https://example.com/foo',
        form_json: {
          foo: 'example'
        }
      })

      log = make_log()
      syncer = SimpleSyncer.new(log: log)
      records_within_scope = ImportedForm.where(form_key: form_key)
      syncer.sync_and_delete_unmarked!([record], records_within_scope)

      expect(ImportedForm.all.size >= 1).to eq true
      expect(record.valid?).to eq true
      expect(log.output).to include('records_within_import_scope.size: 2 in Insights')
      expect(syncer.stats).to eq({
        total_sync_calls_count: 1,
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        destroyed_records_count: 1,
        created_rows_count: 1,
        marked_ids_count: 1,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {}
      })
    end
  end
end
