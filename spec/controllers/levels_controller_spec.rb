require 'rails_helper'

describe LevelsController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#show_json' do
    def get_show_json(educator, params = {})
      sign_in(educator)
      get :show_json, params: {
        format: :json,
        school_id: pals.shs.id,
        time_now: pals.time_now.to_i
      }
      sign_out(educator)
      response
    end

    it 'allows everyone access, but only to authorized students in that school' do
      (Educator.all - [pals.uri]).each do |educator|
        authorized_students = Authorizer.new(educator).authorized { Student.active.to_a }
        response = get_show_json(educator)
        expect(response.status).to eq 200

        json = JSON.parse(response.body)
        expect(json['students_with_levels'].size).to be <= authorized_students.size
        expect(authorized_students.map(&:id)).to include(*json['students_with_levels'].map {|s| s['id'] })
      end
    end

    context 'for educator with access' do
      it 'works on happy path' do
        response = get_show_json(pals.uri)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)

        # check shape of data
        expect(json.keys).to eq ['students_with_levels']
        expect(json['students_with_levels'].size).to eq 3
        expect(json['students_with_levels'].map(&:keys).flatten.uniq).to contain_exactly(*[
          "id",
          "grade",
          "first_name",
          "last_name",
          "limited_english_proficiency",
          "program_assigned",
          "sped_placement",
          "house",
          "student_section_assignments_right_now",
          "level",
          "notes"
        ])
        expect(json['students_with_levels'].map {|s| s['notes'].keys }.flatten.uniq).to eq([
          "last_sst_note",
          "last_experience_note",
          "last_counselor_note",
          "last_other_note"
        ])

        # time_now is in Q3, so this includes one D for mari and one failure for kylo
        expect(json['students_with_levels'].map {|student| student['level']}).to contain_exactly(*[
        { # mari
          "level_number"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>0,
            "course_ds"=>1,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        }, { # amir
          "level_number"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>0,
            "course_ds"=>0,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        }, { # kylo
          "level_number"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>1,
            "course_ds"=>0,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        }])
      end
    end
  end
end
