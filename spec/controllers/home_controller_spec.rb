require 'rails_helper'

describe HomeController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }

  describe '#feed_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_jodi)
      get :feed_json, params: {
        time_now: time_now.to_i.to_s,
        limit: 4
      }
      expect(response.code).to eq '200'
      json = JSON.parse(response.body)
      expect(json).to eq({
        "feed_cards"=>['wat']
      })
    end
  end

  describe '#unsupported_low_grades_json' do
    it 'works end-to-end' do
      sign_in(pals.shs_jodi)
      get :unsupported_low_grades_json, params: { time_now: time_now.to_i.to_s }
      expect(response.code).to eq '200'
      json = JSON.parse(response.body)
      expect(json).to eq({
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
  end
end
