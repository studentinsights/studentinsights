require 'spec_helper'

RSpec.describe InsightUnsupportedLowGrades do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }
  let!(:insight) { InsightUnsupportedLowGrades.new(pals.shs_jodi) }

  describe '#assignments_below_threshold' do
    it 'finds Mari in Biology' do
      grade_threshold = 69
      assignments = insight.send(:assignments_below_threshold, Student.all.map(&:id), grade_threshold)
      expect(assignments.size).to eq 1
      expect(assignments.all? {|a| a.grade_numeric < grade_threshold }).to eq true
    end
  end

  describe '#recently_commented_student_ids' do
    let!(:time_threshold) { time_now - 30.days }
    let!(:nge_event_note_type) { EventNoteType.find(305) }
    let!(:tenge_event_note_type) { EventNoteType.find(305) }
    let!(:student_ids) { [pals.shs_freshman_mari] }
    let!(:assignment) { pals.shs_freshman_mari.student_section_assignments.first }

    it 'with no comment' do
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end

    it 'with NGE comment' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: nge_event_note_type,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq [
        pals.shs_freshman_mari.id
      ]
    end

    it 'with 10GE comment' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: nge_event_note_type,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq [
        pals.shs_freshman_mari.id
      ]
    end

    it 'respects time_threshold' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: tenge_event_note_type,
        text: 'blah',
        recorded_at: time_now - 40.days
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end
  end

  describe '#serialize_assignment' do
    it 'returns the right shape' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      json = insight.send(:serialize_assignment, assignment)
      expect(json.keys).to eq(['id', 'grade_numeric', 'grade_letter', 'student', 'section'])
      expect(json['student'].keys).to eq(['id', 'grade', 'first_name', 'last_name', 'house'])
      expect(json['section'].keys).to eq(['id', 'section_number', 'schedule', 'room_number', 'educators'])
      expect(json['section']['educators'].first.keys).to eq(['id', 'email', 'full_name'])
    end
  end
end
