require 'rails_helper'

describe ReadingController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#reading_json' do
    it 'works when no data' do
      puts '>>wat'
      puts Student.all.where(grade: '5')
      sign_in(pals.uri)
      get :reading_json, params: {
        school_slug: 'hea',
        grade: '5'
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to eq ['school', 'entry_doc', 'reading_students', 'latest_mtss_notes']
      expect(json).to eq({
        "entry_doc" => {},
        "latest_mtss_notes" => [],
        "reading_students" => [],
        "school" => {
          "id"=>2,
          "name"=>"Arthur D Healey",
          "slug"=>"hea"
        }
      })
    end
  end

  describe '#update_data_point_json' do
    # it 'works end-to-end' do
    #   sign_in(pals.uri)
    #   get :reading_json, params: {
    #     school_slug: 'hea',
    #     grade: '3'
    #   }
    #   expect(response.status).to eq 200
    #   json = JSON.parse(response.body)
    #   expect(json.keys).to eq ['school', 'entry_doc', 'reading_students', 'latest_mtss_notes']
    #   expect(json).to eq({})
    #   sign_in(pals.shs_bill_nye)
    #   get :students_with_low_grades_json, params: {
    #     limit: 100,
    #     time_now: time_now.to_i.to_s
    #   }
    #   expect(response.status).to eq 200
    #   expect(JSON.parse(response.body)).to eq({
    #     "limit"=>100,
    #     "total_count"=>1,
    #     "students_with_low_grades" => [{
    #       "student"=>{
    #         "id"=>pals.shs_freshman_mari.id,
    #         "grade"=>"9",
    #         "first_name"=>"Mari",
    #         "last_name"=>"Kenobi",
    #         "house"=>'Beacon'
    #       },
    #       "assignments"=>[{
    #         "id"=>pals.shs_freshman_mari.student_section_assignments.first.id,
    #         "grade_numeric"=>"67.0",
    #         "grade_letter"=>"D",
    #         "section"=>{
    #           "id"=>pals.shs_tuesday_biology_section.id,
    #           "section_number"=>"SHS-BIO-TUES",
    #           "course_description"=>'BIOLOGY 1 HONORS',
    #           "educators"=>[{
    #             "id"=>pals.shs_bill_nye.id,
    #             "email"=>"bill@demo.studentinsights.org",
    #             "full_name"=>"Teacher, Bill"
    #           }]
    #         }
    #       }]
    #     }]
    #   })
    # end
  end
end
