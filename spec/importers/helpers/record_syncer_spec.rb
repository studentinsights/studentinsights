require 'rails_helper'

RSpec.describe RecordSyncer do
  let(:time_now) { Time.parse('2018-07-13 12:22:02 -0400') }

  def make_log
    LogHelper::FakeLog.new
  end

  def make_syncer(options = {})
    RecordSyncer.new({ log: make_log }.merge(options))
  end

  def new_test_absence(attributes = {})
    student = FactoryBot.create(:student)
    Absence.new({
      occurred_at: time_now - 62.days,
      student: student
    })
  end

  def create_test_absence!(attributes = {})
    new_test_absence.tap(&:save!)
  end

  describe '#validate_mark_and_sync!' do
    it 'when nil, counts it and does nothing' do
      syncer = make_syncer
      expect(syncer.validate_mark_and_sync!(nil)).to eq(:nil)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 1,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 0
      })
    end

    it 'when new and invalid, counts it and does nothing' do
      syncer = make_syncer
      expect(syncer.validate_mark_and_sync!(Absence.new)).to eq(:invalid)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 1,
        validation_failure_counts_by_field: {
          student_id: 1,
          occurred_at: 1
        },
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 0
      })
    end

    it 'when persisted but would become invalid, counts it, leaves it unmarked, and does nothing' do
      syncer = make_syncer
      absence = create_test_absence!
      absence.assign_attributes(student: nil)
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:invalid)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 1,
        validation_failure_counts_by_field: {
          student_id: 1
        },
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 0
      })
    end

    it 'when persisted and unchanged, counts it and marks it, and does nothing' do
      syncer = make_syncer
      absence = create_test_absence!
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:unchanged)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 1,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 1,
        destroyed_records_count: 0
      })
    end

    it 'when persisted and changed, updates, marks and counts it' do
      syncer = make_syncer
      absence = create_test_absence!
      absence.assign_attributes(reason: 'new reason added!')
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:updated)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 1,
        created_rows_count: 0,
        marked_ids_count: 1,
        destroyed_records_count: 0
      })
    end

    it 'when new, creates, marks and counts it and marks a valid record id' do
      syncer = make_syncer
      absence = new_test_absence
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:created)
      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 1,
        marked_ids_count: 1,
        destroyed_records_count: 0
      })
      expect(syncer.instance_variable_get(:@marked_ids)).to eq [absence.id]
    end
  end

  describe '#process_unmarked_records!' do
    let(:pals) { TestPals.create! }
    it 'supports doing something other than deleting, using Student as test case' do
      log = make_log
      syncer = make_syncer(log: log)
      records_within_scope = Student.where(id: [
        pals.shs_freshman_mari.id,
        pals.shs_freshman_amir.id,
        pals.shs_senior_kylo.id
      ])
      expect(syncer.validate_mark_and_sync!(pals.shs_freshman_mari)).to eq(:unchanged)

      records_processed_count = syncer.process_unmarked_records!(records_within_scope) do |student, index|
        student.update!(enrollment_status: 'Withdrawn')
      end
      expect(records_processed_count).to eq 2
      expect(pals.shs_freshman_amir.reload.enrollment_status).to eq 'Withdrawn'
      expect(pals.shs_senior_kylo.reload.enrollment_status).to eq 'Withdrawn'
      expect(pals.shs_freshman_mari.reload.enrollment_status).to eq 'Active'
      expect(pals.healey_kindergarten_student.reload.enrollment_status).to eq 'Active'
      expect(pals.west_eighth_ryan.reload.enrollment_status).to eq 'Active'
    end
  end

  describe '#delete_unmarked_records!' do
    it 'does nothing to unmarked records outside of scope' do
      log = make_log
      syncer = make_syncer(log: log)
      create_test_absence!
      expect(Absence.count).to eq(1)
      records_within_scope = Absence.where('occurred_at > ?', time_now)

      expect(syncer.delete_unmarked_records!(records_within_scope)).to eq(0)
      expect(Absence.count).to eq(1)

      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 0
      })
    end

    it 'keeps two marked records, destroys one unmarked record' do
      log = make_log
      syncer = make_syncer(log: log)
      a = create_test_absence!(occurred_at: time_now - 1.days)
      b = create_test_absence!(occurred_at: time_now - 2.days)
      c = create_test_absence!(occurred_at: time_now - 3.days)
      expect(Absence.count).to eq(3)
      expect(syncer.validate_mark_and_sync!(a)).to eq(:unchanged)
      expect(syncer.validate_mark_and_sync!(b)).to eq(:unchanged)

      expect(syncer.delete_unmarked_records!(Absence.all)).to eq(1)
      expect(Absence.count).to eq(2)
      expect(Absence.all.map(&:id)).to contain_exactly(a.id, b.id)
      expect(Absence.all.map(&:id)).not_to include(c.id)
      expected_log_output = <<~HEREDOC
        RecordSyncer: delete_unmarked_records starting...
        RecordSyncer: process_unmarked_records starting...
        RecordSyncer:   records_within_import_scope.size: 3 in Insights
        RecordSyncer:   @marked_ids.size = 2 from this import
        RecordSyncer:   unmarked_ids: [#{c.id}]
        RecordSyncer:   records_to_process.size: 1 within scope
        RecordSyncer: process_unmarked_records done.
        RecordSyncer: delete_unmarked_records done.
      HEREDOC
      expect(log.output).to eq expected_log_output.strip

      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 2,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 2,
        destroyed_records_count: 1
      })
    end

    it 'deletes all records in scope if nothing was marked' do
      log = make_log
      syncer = make_syncer(log: log)
      5.times {|i| create_test_absence!(occurred_at: time_now - i.days) }
      expect(Absence.count).to eq(5)

      expect(syncer.delete_unmarked_records!(Absence.all)).to eq(5)
      expect(Absence.count).to eq(0)

      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 5
      })
    end

    it 'does not delete newly created records' do
      syncer = make_syncer
      absence = new_test_absence
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:created)
      expect(Absence.count).to eq(1)

      expect(syncer.delete_unmarked_records!(Absence.all)).to eq(0)

      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 0,
        validation_failure_counts_by_field: {},
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 1,
        marked_ids_count: 1,
        destroyed_records_count: 0
      })
    end

    it 'handles edge case with a persisted record that would become invalid, deleting the Insights record rather than keeping stale values' do
      syncer = make_syncer
      absence = create_test_absence!
      absence.assign_attributes(student: nil)
      expect(syncer.validate_mark_and_sync!(absence)).to eq(:invalid)
      expect(Absence.count).to eq(1)

      expect(syncer.delete_unmarked_records!(Absence.all)).to eq(1)
      expect(Absence.count).to eq(0)

      expect(syncer.stats).to eq({
        passed_nil_record_count: 0,
        invalid_rows_count: 1,
        validation_failure_counts_by_field: {
          student_id: 1
        },
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        created_rows_count: 0,
        marked_ids_count: 0,
        destroyed_records_count: 1
      })
    end
  end
end
