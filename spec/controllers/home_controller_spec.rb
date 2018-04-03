require 'rails_helper'

describe HomeController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#feed_json' do
    def create_event_note(time_now, options = {})
      EventNote.create!(options.merge({
        educator: pals.uri,
        text: 'blah',
        recorded_at: time_now - 7.days
      }))
    end

    it 'works end-to-end for event_note, incident and birthday' do
      event_note = create_event_note(time_now, {
        student: pals.shs_freshman_mari,
        event_note_type: EventNoteType.find(305)
      })
      incident = DisciplineIncident.create!({
        incident_code: 'Bullying',
        occurred_at: time_now - 4.days,
        student: pals.shs_freshman_mari
      })
      sign_in(pals.shs_jodi)
      get :feed_json, params: {
        time_now: time_now.to_i.to_s,
        limit: 4,
        include_incident_cards: true
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['feed_cards'].length).to eq 3
      expect(json).to eq({
        "feed_cards"=>[{
          "type"=>"birthday_card",
          "timestamp"=>"2018-03-12T00:00:00.000Z",
          "json"=>{
            "id"=>pals.shs_freshman_mari.id,
            "first_name"=>"Mari",
            "last_name"=>"Kenobi",
            "date_of_birth"=>"2004-03-12T00:00:00.000Z"
          }
        }, {
          "type"=>"incident_card",
          "timestamp"=>"2018-03-09T11:03:00.000Z",
          "json"=>{
            "id"=>incident.id,
            "incident_code"=>"Bullying",
            "incident_location"=>nil,
            "incident_description"=>nil,
            "occurred_at"=>"2018-03-09T11:03:00.000Z",
            "has_exact_time"=>nil,
            "student"=>{
              "id"=>pals.shs_freshman_mari.id,
              "grade"=>"9",
              "first_name"=>"Mari",
              "last_name"=>"Kenobi",
              "house"=>"Beacon",
              "homeroom"=>{
                "id"=>pals.shs_jodi_homeroom.id,
                "name"=>"SHS 942",
                "educator"=>{
                  "id"=>pals.shs_jodi.id,
                  "email"=>"jodi@demo.studentinsights.org",
                  "full_name"=>"Teacher, Jodi"
                }
              }
            }
          }
        }, {
          "type"=>"event_note_card",
          "timestamp"=>"2018-03-06T11:03:00.000Z",
          "json"=>{
            "id"=>event_note.id,
            "event_note_type_id"=>305,
            "text"=>"blah",
            "recorded_at"=>"2018-03-06T11:03:00.000Z",
            "educator"=>{
              "id"=>pals.uri.id,
              "email"=>"uri@demo.studentinsights.org",
              "full_name"=>"Disney, Uri"
            },
            "student"=>{
              "id"=>pals.shs_freshman_mari.id,
              "grade"=>"9",
              "first_name"=>"Mari",
              "last_name"=>"Kenobi",
              "house"=>'Beacon',
              "homeroom"=>{
                "id"=>pals.shs_jodi_homeroom.id,
                "name"=>"SHS 942",
                "educator"=>{
                  "id"=>pals.shs_jodi.id,
                  "email"=>"jodi@demo.studentinsights.org",
                  "full_name"=>"Teacher, Jodi"
                }
              }
            }
          }
        }]
      })
    end

    describe 'doppleganging' do
      def get_feed(as_educator, for_educator, time_now)
        sign_in(as_educator)
        get :feed_json, params: {
          time_now: time_now.to_i.to_s,
          educator_id: for_educator.id,
          limit: 4
        }
        expect(response.status).to eq 200
        JSON.parse(response.body)
      end

      # Returns the set of student ids, used
      # to check authorization
      def feed_student_ids(json)
        student_ids = json['feed_cards'].map do |card|
          if card['type'] == 'birthday_card'
            card['json']['id']
          elsif card['type'] == 'event_note_card'
            card['json']['student']['id']
          else
            nil
          end
        end

        student_ids.compact.uniq
      end

      before do
        create_event_note(time_now, {
          student: pals.shs_freshman_mari,
          event_note_type: EventNoteType.find(305)
        })
        create_event_note(time_now, {
          student: pals.healey_kindergarten_student,
          event_note_type: EventNoteType.find(300)
        })
      end

      it 'allows uri as jodi' do
        json = get_feed(pals.uri, pals.shs_jodi, time_now)
        expect(feed_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'allows uri as vivian' do
        json = get_feed(pals.uri, pals.healey_vivian_teacher, time_now)
        expect(feed_student_ids(json)).to eq [
          pals.healey_kindergarten_student.id
        ]
      end

      it 'guards against jodi doppleganging as vivian' do
        json = get_feed(pals.shs_jodi, pals.uri, time_now)
        expect(feed_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'guards against vivian doppleganging as uri' do
        json = get_feed(pals.healey_vivian_teacher, pals.uri, time_now)
        expect(feed_student_ids(json)).to eq [
          pals.healey_kindergarten_student.id
        ]
      end
    end
  end

  describe '#students_with_low_grades_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_bill_nye)
      get :students_with_low_grades_json, params: {
        limit: 100,
        time_now: time_now.to_i.to_s
      }
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq({
        "limit"=>100,
        "total_count"=>1,
        "students_with_low_grades" => [{
          "student"=>{
            "id"=>pals.shs_freshman_mari.id,
            "grade"=>"9",
            "first_name"=>"Mari",
            "last_name"=>"Kenobi",
            "house"=>'Beacon'
          },
          "assignments"=>[{
            "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
            "grade_numeric"=>"67.0",
            "grade_letter"=>"D",
            "section"=>{
              "id"=>pals.shs_tuesday_biology_section.id,
              "section_number"=>"SHS-BIO-TUES",
              "course_description"=>'BIOLOGY 1 HONORS',
              "educators"=>[{
                "id"=>pals.shs_bill_nye.id,
                "email"=>"bill@demo.studentinsights.org",
                "full_name"=>"Teacher, Bill"
              }]
            }
          }]
        }]
      })
    end

    describe 'doppleganging' do
      def get_students_with_low_grades(as_educator, for_educator, time_now)
        sign_in(as_educator)
        get :students_with_low_grades_json, params: {
          time_now: time_now.to_i.to_s,
          educator_id: for_educator.id,
          limit: 100
        }
        expect(response.status).to eq 200
        JSON.parse(response.body)
      end

      def low_grade_student_ids(json)
        json['students_with_low_grades'].map do |assignment|
          assignment['student']['id']
        end
      end

      it 'allows Uri as Bill' do
        json = get_students_with_low_grades(pals.uri, pals.shs_bill_nye, time_now)
        expect(low_grade_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'allows Uri as Vivian' do
        json = get_students_with_low_grades(pals.uri, pals.healey_vivian_teacher, time_now)
        expect(low_grade_student_ids(json)).to eq []
      end

      it 'guards against Bill doppleganging as Vivian' do
        json = get_students_with_low_grades(pals.shs_bill_nye, pals.uri, time_now)
        expect(low_grade_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'guards against Vivian doppleganging as Uri' do
        json = get_students_with_low_grades(pals.healey_vivian_teacher, pals.uri, time_now)
        expect(low_grade_student_ids(json)).to eq []
      end
    end
  end

  describe '#students_with_high_absences_json' do
    # with absences for Mari as the test case
    before do
      4.times do |index|
        Absence.create!({
          occurred_at: time_now - index.days,
          student: pals.shs_freshman_mari
        })
      end
    end

    it 'works end-to-end' do
      sign_in(pals.shs_bill_nye)
      get :students_with_high_absences_json, params: {
        limit: 100,
        time_now: time_now.to_i.to_s
      }
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq({
        "limit"=>100,
        "total_students"=>1,
        "students_with_high_absences"=>[{
          "count" => 4,
          "student" => {
            "id"=> pals.shs_freshman_mari.id,
            "grade"=>"9",
            "first_name"=>"Mari",
            "last_name"=>"Kenobi",
            "home_language"=>nil,
            "house"=>"Beacon"
          }
        }]
      })
    end

    describe 'doppleganging' do
      def get_students_with_high_absences(as_educator, for_educator, time_now)
        sign_in(as_educator)
        get :students_with_high_absences_json, params: {
          time_now: time_now.to_i.to_s,
          educator_id: for_educator.id,
          limit: 100
        }
        expect(response.status).to eq 200
        JSON.parse(response.body)
      end

      def high_absences_student_ids(json)
        json['students_with_high_absences'].map do |row|
          row['student']['id']
        end
      end

      it 'allows Uri as Bill' do
        json = get_students_with_high_absences(pals.uri, pals.shs_bill_nye, time_now)
        expect(high_absences_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'allows Uri as Vivian' do
        json = get_students_with_high_absences(pals.uri, pals.healey_vivian_teacher, time_now)
        expect(high_absences_student_ids(json)).to eq []
      end

      it 'guards against Bill doppleganging as Vivian' do
        json = get_students_with_high_absences(pals.shs_bill_nye, pals.uri, time_now)
        expect(high_absences_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'guards against Vivian doppleganging as Uri' do
        json = get_students_with_high_absences(pals.healey_vivian_teacher, pals.uri, time_now)
        expect(high_absences_student_ids(json)).to eq []
      end
    end
  end
end
