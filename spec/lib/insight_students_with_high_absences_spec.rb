require 'spec_helper'

RSpec.describe InsightStudentsWithHighAbsences do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }

  describe '#students_with_high_absences_json' do
    it 'finds no one for Fatima' do
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_fatima_science_teacher)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq []
    end

    it 'finds Mari for Bill when at threshold' do
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_bill_nye)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq [{
        :count=> 4,
        :student => {
          "id"=> pals.shs_freshman_mari.id,
          "grade"=>"9",
          "first_name"=>"Mari",
          "last_name"=>"Kenobi",
          "house"=>"Beacon"
        }
      }]
    end

    it 'finds no one for Bill when under threshold' do
      pals.shs_freshman_mari.absences.destroy_all
      3.times do |index|
        Absence.create!({
          occurred_at: time_now - index.days,
          student: pals.shs_freshman_mari
        })
      end
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_bill_nye)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq []
    end
  end

  describe '#recently_commented_student_ids' do
    let!(:insight) { InsightStudentsWithHighAbsences.new(pals.shs_bill_nye) }
    let!(:time_threshold) { time_now - 45.days }
    let!(:student_ids) { [pals.shs_freshman_mari] }
    let!(:sst_event_note_type) { EventNoteType.find(300) }

    it 'with no comment' do
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end

    it 'with SST comment' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: sst_event_note_type,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq [
        pals.shs_freshman_mari.id
      ]
    end

    it 'always excludes restricted notes' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: sst_event_note_type,
        is_restricted: true,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end

    it 'respects time_threshold' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: sst_event_note_type,
        text: 'blah',
        recorded_at: time_now - 50.days
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end
  end
end
