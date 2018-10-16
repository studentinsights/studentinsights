require 'spec_helper'

RSpec.describe HistoricalLevelsSnapshot do
  let!(:pals) { TestPals.create! }

  describe '.snapshot!' do
    it 'works' do
      log = LogHelper::FakeLog.new
      snapshot = HistoricalLevelsSnapshot.snapshot!({
        time_now: pals.time_now,
        log: log,
      })

      expect(HistoricalLevelsSnapshot.all.size).to eq 1
      expect(HistoricalLevelsSnapshot.first.reload).to eq snapshot.reload
      expect(snapshot.time_now).to eq pals.time_now
      expect(snapshot.student_ids).to contain_exactly(*[
        pals.shs_freshman_mari.id,
        pals.shs_freshman_amir.id,
        pals.shs_senior_kylo.id
      ])

      expect(snapshot.students_with_levels_json.size).to eq 3
      expect(snapshot.students_with_levels_json.first.keys).to contain_exactly(*[
        'id',
        'grade',
        'first_name',
        'last_name',
        'program_assigned',
        'sped_placement',
        'limited_english_proficiency',
        'house',
        'level',
        'notes',
        'student_section_assignments_right_now'
      ])
    end
  end
end
