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
      
      course_descriptions = snapshot.students_with_levels_json.flat_map do |student_json|
        student_json['student_section_assignments_right_now'].map do |assignment_json|
          assignment_json['section']['course_description']
        end
      end
      expect(snapshot.students_with_levels_json.size).to eq 3
      expect(course_descriptions).to eq 'rew'
    end
  end
end