require 'rails_helper'

describe HomeController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }

  describe '#unsupported_low_grades_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_jodi)
      get :unsupported_low_grades_json
      expect(response.code).to eq '200'
      json = JSON.parse(response.body)
      expect(json).to eq({
        "assignments"=>[{
          "id"=>1,
          "grade_numeric"=>"67.0",
          "grade_letter"=>nil,
          "student"=>{
            "id"=> pals.shs_freshman_mari.id,
            "grade"=> "9",
            "first_name"=>"Mari",
            "last_name"=>"Kenobi",
            "house"=>nil
          },
          "section"=>{
            "id"=>1,
            "section_number"=>"SHS-BIO-TUES",
            "schedule"=>nil,
            "room_number"=>nil,
            "educators"=>[{
              "id"=>pals.shs_bill_nye.id,
              "email"=>"bill@demo.studentinsights.org",
              "full_name"=>"Teacher, Bill"
            }]
          }
        }]
      })
    end
  end

  describe '#serialize_assignment' do
    it 'returns the right shape' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      json = controller.send(:serialize_assignment, assignment)
      expect(json.keys).to eq(['id', 'grade_numeric', 'grade_letter', 'student', 'section'])
      expect(json['student'].keys).to eq(['id', 'grade', 'first_name', 'last_name', 'house'])
      expect(json['section'].keys).to eq(['id', 'section_number', 'schedule', 'room_number', 'educators'])
      expect(json['section']['educators'].first.keys).to eq(['id', 'email', 'full_name'])
    end
  end

  describe '#has_experience_team_commented?' do
    let!(:time_threshold) { time_now - 30.days }
    let!(:nge_event_note_type) { EventNoteType.find(305) }
    let!(:tenge_event_note_type) { EventNoteType.find(305) }  

    it 'with no comment' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      has_commented = controller.send(:has_experience_team_commented?, assignment, time_threshold: time_now - 30.days)
      expect(has_commented).to eq false
    end

    it 'with NGE comment' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: nge_event_note_type,
        text: 'blah',
        recorded_at: time_now
      )
      has_commented = controller.send(:has_experience_team_commented?, assignment, time_threshold: time_threshold)
      expect(has_commented).to eq true
    end

    it 'with 10GE comment' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: nge_event_note_type,
        text: 'blah',
        recorded_at: time_now
      )
      has_commented = controller.send(:has_experience_team_commented?, assignment, time_threshold: time_threshold)
      expect(has_commented).to eq true
    end

    it 'respects time_threshold' do
      assignment = pals.shs_freshman_mari.student_section_assignments.first
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: tenge_event_note_type,
        text: 'blah',
        recorded_at: time_now - 40.days
      )
      has_commented = controller.send(:has_experience_team_commented?, assignment, time_threshold: time_threshold)
      expect(has_commented).to eq false
    end
  end

  describe '#assignments_below_threshold' do
    it 'finds Mari in Biology' do
      grade_threshold = 69
      assignments = controller.send(:assignments_below_threshold, Student.all.map(&:id), grade_threshold: grade_threshold)
      expect(assignments.size).to eq 1
      expect(assignments.all? {|a| a.grade_numeric < grade_threshold }).to eq true
    end
  end
end
