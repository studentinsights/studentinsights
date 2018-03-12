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

    it 'works end-to-end for birthday and event_note' do
      event_note = create_event_note(time_now, {
        student: pals.shs_freshman_mari,
        event_note_type: EventNoteType.find(305)
      })
      sign_in(pals.shs_jodi)
      get :feed_json, params: {
        time_now: time_now.to_i.to_s,
        limit: 4
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['feed_cards'].length).to eq 2
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
              "house"=>nil,
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

  describe '#unsupported_low_grades_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_jodi)
      get :unsupported_low_grades_json, params: {
        limit: 100,
        time_now: time_now.to_i.to_s
      }
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq({
        "limit"=>100,
        "total_count"=>1,
        "assignments"=>[{
          "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
          "grade_numeric"=>"67.0",
          "grade_letter"=>'D',
          "student"=>{
            "id"=> pals.shs_freshman_mari.id,
            "grade"=> "9",
            "first_name"=>"Mari",
            "last_name"=>"Kenobi",
            "house"=>nil
          },
          "section"=>{
            "id"=>pals.shs_tuesday_biology_section.id,
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

    describe 'doppleganging' do
      def get_unsupported(as_educator, for_educator, time_now)
        sign_in(as_educator)
        get :unsupported_low_grades_json, params: {
          time_now: time_now.to_i.to_s,
          educator_id: for_educator.id,
          limit: 100
        }
        expect(response.status).to eq 200
        JSON.parse(response.body)
      end

      def unsupported_student_ids(json)
        json['assignments'].map do |assignment|
          assignment['student']['id']
        end
      end

      it 'allows uri as jodi' do
        json = get_unsupported(pals.uri, pals.shs_jodi, time_now)
        expect(unsupported_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'allows uri as vivian' do
        json = get_unsupported(pals.uri, pals.healey_vivian_teacher, time_now)
        expect(unsupported_student_ids(json)).to eq []
      end

      it 'guards against jodi doppleganging as vivian' do
        json = get_unsupported(pals.shs_jodi, pals.uri, time_now)
        expect(unsupported_student_ids(json)).to eq [
          pals.shs_freshman_mari.id
        ]
      end

      it 'guards against vivian doppleganging as uri' do
        json = get_unsupported(pals.healey_vivian_teacher, pals.uri, time_now)
        expect(unsupported_student_ids(json)).to eq []
      end
    end
  end
end
