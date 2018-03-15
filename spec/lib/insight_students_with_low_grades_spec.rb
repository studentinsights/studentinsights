require 'spec_helper'

RSpec.describe InsightStudentsWithLowGrades do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }

  describe '#students_as_json' do
    it 'finds no one for Jodi' do
      time_threshold = time_now - 30.days
      grade_threshold = 69
      insight = InsightStudentsWithLowGrades.new(pals.shs_jodi)
      students_with_low_grades = insight.students_as_json(time_now, time_threshold, grade_threshold)
      expect(students_with_low_grades).to eq []
    end

    it 'finds Mari for Bill' do
      time_threshold = time_now - 30.days
      grade_threshold = 69
      insight = InsightStudentsWithLowGrades.new(pals.shs_bill_nye)
      students_with_low_grades = insight.students_as_json(time_now, time_threshold, grade_threshold)
      expect(students_with_low_grades).to eq [{
        "student"=>{
          "id"=>pals.shs_freshman_mari.id,
          "first_name"=>'Mari',
          "last_name"=>'Kenobi',
          "grade"=>'9',
          "house"=>nil
        },
        "assignments"=>[{
          "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
          "grade_numeric"=>'67.0',
          "grade_letter"=>"D",
          "section"=>{
            "id"=>pals.shs_freshman_mari.student_section_assignments.first.section.id,
            "section_number"=>"SHS-BIO-TUES",
            "course_description"=>nil,
            "educators"=>[{
              "id"=>pals.shs_bill_nye.id,
              "email"=>"bill@demo.studentinsights.org",
              "full_name"=>"Teacher, Bill"
            }]
          }
        }]
      }]
    end
  end

  describe '#assignments_below_threshold' do
    let!(:insight) { InsightStudentsWithLowGrades.new(pals.shs_bill_nye) }
    it "finds Mari in Bill's Biology class" do
      grade_threshold = 69
      assignments = insight.send(:assignments_below_threshold, grade_threshold)
      expect(assignments.size).to eq 1
      expect(assignments.all? {|a| a.grade_numeric < grade_threshold }).to eq true
    end
  end

  describe '#recently_commented_student_ids' do
    let!(:insight) { InsightStudentsWithLowGrades.new(pals.shs_bill_nye) }
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
    let!(:insight) { InsightStudentsWithLowGrades.new(pals.shs_bill_nye) }
    it 'returns the right shape' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      json = insight.send(:serialize_assignment, assignment)
      expect(json.keys).to eq(['id', 'grade_numeric', 'grade_letter', 'section'])
      expect(json['section'].keys).to eq(['id', 'section_number', 'course_description', 'educators'])
      expect(json['section']['educators'].first.keys).to eq(['id', 'email', 'full_name'])
    end
  end
end
