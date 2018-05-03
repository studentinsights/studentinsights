require 'rails_helper'

describe ClassroomBalancingController, :type => :controller do
  def create_balancing_by(educator)
    ClassroomsForGrade.create!({
      balance_id: 'foo-balance-id',
      created_by_educator_id: educator.id,
      school_id: pals.healey.id,
      grade_level_next_year: '4',
      json: { foo: 'bar' }
    })
  end

  before { request.env['HTTPS'] = 'on' }
  before { request.env['HTTP_ACCEPT'] = 'application/json' }
  let!(:pals) { TestPals.create! }

  describe '#available_grade_levels_json' do
    def request_available_grade_levels_json(educator)
      sign_in(educator)
      get :available_grade_levels_json, params: {
        format: :json,
        balance_id: 'foo-balance-id'
      }
    end

    context 'New Bedford' do
      before do
        @district_key = ENV['DISTRICT_KEY']
        ENV['DISTRICT_KEY'] = PerDistrict::NEW_BEDFORD
      end

      after do
        ENV['DISTRICT_KEY'] = @district_key
      end

      it 'does not work' do
        request_available_grade_levels_json(pals.uri)
        expect(response.status).to eq 403
      end
    end

    it 'works for Uri' do
      request_available_grade_levels_json(pals.uri)
      json = JSON.parse(response.body)
      expect(json["default_grade_level_next_year"]).to eq('1')
      expect(json["grade_levels_next_year"]).to eq(["1", "2", "3", "4", "5", "6"])
      expect(json["default_school_id"]).to eq(pals.healey.id)
      expect(json["schools"].length).to eq 8
    end

    it 'works for Sarah' do
      request_available_grade_levels_json(pals.healey_sarah_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["default_grade_level_next_year"]).to eq('6')
      expect(json["grade_levels_next_year"]).to eq(["1", "2", "3", "4", "5", "6"])
      expect(json["default_school_id"]).to eq(pals.healey.id)
      expect(json["schools"].length).to eq 8
    end
  end

  describe '#students_for_grade_level_next_year_json' do
    def request_students_for_grade_level_next_year_json(educator)
      sign_in(educator)
      get :students_for_grade_level_next_year_json, params: {
        format: :json,
        balance_id: 'foo-balance-id',
        school_id: pals.healey.id,
        grade_level_next_year: '3'
      }
    end

    # create some fifth grade students
    before do
      school = pals.healey
      grade = '2'
      3.times do |n|
        homeroom = Homeroom.create!(name: "HR #{grade}-#{n}", grade: grade, school: school)
        1.times do
          FactoryBot.create(:student, {
            grade: grade,
            school: school,
            homeroom: homeroom
          })
        end
      end
    end

    it 'works for Uri' do
      request_students_for_grade_level_next_year_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json.keys).to eq(["students", "educator_names", "current_educator_name"])
      expect(json["current_educator_name"]).to eq(pals.uri.full_name)
      expect(json["educator_names"]).to contain_exactly *[
        pals.healey_laura_principal.full_name,
        pals.healey_sarah_teacher.full_name
      ]
      expect(json["students"].length).to eq 3
      expect(json["students"].first.keys).to contain_exactly *[
        "id",
        "first_name",
        "last_name",
        "date_of_birth",
        "disability",
        "program_assigned",
        "limited_english_proficiency",
        "plan_504",
        "home_language",
        "free_reduced_lunch",
        "race",
        "hispanic_latino",
        "iep_document",
        "gender",
        "most_recent_star_math_percentile",
        "most_recent_star_reading_percentile",
        "latest_access_results",
        "latest_dibels",
        "most_recent_school_year_discipline_incidents_count"
      ]
    end

    it 'guards authorization for Sarah' do
      request_students_for_grade_level_next_year_json(pals.healey_sarah_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].length).to eq 0
    end

    it 'guards authorization for Jodi' do
      request_students_for_grade_level_next_year_json(pals.shs_jodi)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].length).to eq 0
    end

    it 'filters out inactive students' do
      inactive_student = FactoryBot.create(:student, {
        grade: '2',
        enrollment_status: 'Transferred',
        school: pals.healey,
        homeroom: pals.healey.homerooms.first
      })
      request_students_for_grade_level_next_year_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].map {|s| s['id'] }).not_to include(inactive_student.id)
    end
  end

  describe '#classrooms_for_grade_json' do
    def request_classrooms_for_grade_json(educator)
      sign_in(educator)
      get :classrooms_for_grade_json, params: {
        format: :json,
        balance_id: 'foo-balance-id'
      }
    end

    it 'works' do
      create_balancing_by(pals.uri)
      request_classrooms_for_grade_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json).to eq({
        "classrooms_for_grade"=>{
          "balance_id"=>"foo-balance-id",
          "created_by_educator_id"=>pals.uri.id,
          "school_id"=>pals.healey.id,
          "grade_level_next_year"=>'4',
          "json"=>{'foo'=>'bar'}
        }
      })
    end

    it 'does not allow fetching records by other educators' do
      create_balancing_by(pals.healey_sarah_teacher)
      request_classrooms_for_grade_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
    end
  end

  describe '#update_classrooms_for_grade_json' do
    it 'works by creating a new record for each change' do
      create_balancing_by(pals.uri)
      sign_in(pals.uri)
      post :update_classrooms_for_grade_json, params: {
        format: :json,
        balance_id: 'foo-balance-id',
        created_by_educator_id: pals.uri.id,
        school_id: pals.healey.id,
        grade_level_next_year: '2',
        json: { foo: 'bazzzzz' }
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json).to eq({
        "classrooms_for_grade"=>{
          "balance_id"=>"foo-balance-id",
          "created_by_educator_id"=>pals.uri.id,
          "school_id"=>pals.healey.id,
          "grade_level_next_year"=>'2',
          "json"=>{'foo'=>'bazzzzz'}
        }
      })
      expect(ClassroomsForGrade.all.size).to eq(2)
      expect(ClassroomsForGrade.last.balance_id).to eq('foo-balance-id')
    end
  end
end
