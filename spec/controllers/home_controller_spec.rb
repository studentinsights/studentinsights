require 'rails_helper'

describe HomeController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#feed_json' do
    it 'works end-to-end for birthday and event_note' do
      event_note = EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: EventNoteType.find(305),
        text: 'blah',
        recorded_at: time_now - 7.days
      )
      sign_in(pals.shs_jodi)
      get :feed_json, params: {
        time_now: time_now.to_i.to_s,
        limit: 4
      }
      json = JSON.parse(response.body)
      expect(response.code).to eq '200'
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

    it 'allow doppleganging' do
      pending
    end

    it 'guards against doppleganging' do
      pending
    end
  end

  describe '#unsupported_low_grades_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_jodi)
      get :unsupported_low_grades_json, params: {
        limit: 100,
        time_now: time_now.to_i.to_s
      }
      expect(response.code).to eq '200'
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
    
    it 'allow doppleganging' do
      pending
    end

    it 'guards against doppleganging' do
      pending
    end
  end
end
