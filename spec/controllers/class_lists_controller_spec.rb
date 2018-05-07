require 'rails_helper'

describe ClassListsController, :type => :controller do
  def create_class_list_from(educator, params = {})
    ClassList.create!({
      workspace_id: 'foo-workspace-id',
      created_by_educator_id: educator.id,
      school_id: educator.school_id,
      json: { foo: 'bar' }
    }.merge(params))
  end

  before { request.env['HTTPS'] = 'on' }
  before { request.env['HTTP_ACCEPT'] = 'application/json' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#available_grade_levels_json' do
    def request_available_grade_levels_json(educator)
      sign_in(educator)
      get :available_grade_levels_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id'
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
        request_available_grade_levels_json(pals.healey_sarah_teacher)
        expect(response.status).to eq 403
      end
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

    it 'works for Uri' do
      request_available_grade_levels_json(pals.uri)
      json = JSON.parse(response.body)
      expect(json["default_grade_level_next_year"]).to eq('1')
      expect(json["grade_levels_next_year"]).to eq(["1", "2", "3", "4", "5", "6"])
      expect(json["default_school_id"]).to eq(pals.healey.id)
      expect(json["schools"].length).to eq 8
    end
  end

  describe '#students_for_grade_level_next_year_json' do
    def request_students_for_grade_level_next_year_json(educator, params = {})
      sign_in(educator)
      get :students_for_grade_level_next_year_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        school_id: pals.healey.id
      }.merge(params)
    end

    # create some students in second grade and some in fifth grade, all at the healey
    before do
      3.times do |n|
        grade = '2'
        homeroom = Homeroom.create!(name: "HR #{grade}-#{n}", grade: grade, school: pals.healey)
        1.times do
          FactoryBot.create(:student, {
            grade: grade,
            school: pals.healey,
            homeroom: homeroom
          })
        end
      end
      4.times do
        FactoryBot.create(:student, {
          grade: '5',
          school: pals.healey,
          homeroom: pals.healey_fifth_homeroom
        })
      end
    end

    it 'works for Sarah' do
      request_students_for_grade_level_next_year_json(pals.healey_sarah_teacher, grade_level_next_year: '6')
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json.keys).to eq(["students", "educators", "current_educator_id"])
      expect(json["current_educator_id"]).to eq(pals.healey_sarah_teacher.id)
      expect(json["educators"].size).to eq 13
      expect(json["students"].length).to eq 4
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

    it 'filters out inactive students' do
      inactive_student = FactoryBot.create(:student, {
        grade: '5',
        enrollment_status: 'Transferred',
        school: pals.healey,
        homeroom: pals.healey_fifth_homeroom
      })
      request_students_for_grade_level_next_year_json(pals.healey_sarah_teacher, grade_level_next_year: '6')
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].map {|s| s['id'] }).not_to include(inactive_student.id)
    end

    it 'guards authorization for Marcus' do
      request_students_for_grade_level_next_year_json(pals.west_marcus_teacher, grade_level_next_year: '6')
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].length).to eq 0
    end

    it 'guards authorization for Jodi' do
      request_students_for_grade_level_next_year_json(pals.shs_jodi, grade_level_next_year: '6')
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].length).to eq 0
    end

    it 'works for Uri to request students for 3nd grade class next year' do
      request_students_for_grade_level_next_year_json(pals.uri, grade_level_next_year: '3')
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["students"].length).to eq 3
    end
  end

  describe '#class_list_json' do
    def request_class_list_json(educator)
      sign_in(educator)
      get :class_list_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id'
      }
    end

    it 'works for Sarah' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      request_class_list_json(pals.healey_sarah_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json).to eq({
        "class_list"=>{
          "workspace_id"=>"foo-workspace-id",
          "created_by_educator_id"=>pals.healey_sarah_teacher.id,
          "school_id"=>pals.healey.id,
          "grade_level_next_year"=>'6',
          "json"=>{'foo'=>'bar'}
        }
      })
    end

    it 'works for Uri' do
      create_class_list_from(pals.uri, grade_level_next_year: '3')
      request_class_list_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list']).not_to eq(nil)
    end

    it 'does not allow fetching records by other educators' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      request_class_list_json(pals.west_marcus_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
    end
  end

  describe '#update_class_list_json' do
    it 'works by creating a new record for each change' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.healey_sarah_teacher)
      post :update_class_list_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        school_id: pals.healey.id,
        grade_level_next_year: '6',
        json: { foo: 'bazzzzz' }
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json).to eq({
        "class_list"=>{
          "workspace_id"=>"foo-workspace-id",
          "created_by_educator_id"=>pals.healey_sarah_teacher.id,
          "school_id"=>pals.healey.id,
          "grade_level_next_year"=>'6',
          "json"=>{'foo'=>'bazzzzz'}
        }
      })
      expect(ClassList.all.size).to eq(2)
      expect(ClassList.last.workspace_id).to eq('foo-workspace-id')
      expect(ClassList.last.json).to eq({'foo'=>'bazzzzz'})
    end
  end

  describe '#profile_json' do
    let!(:sarah_student) do
      FactoryBot.create(:student, {
        grade: '5',
        school: pals.healey,
        homeroom: pals.healey_fifth_homeroom
      })
    end
    let!(:vivian_student) do
      FactoryBot.create(:student, {
        grade: '5',
        school: pals.healey,
        homeroom: pals.healey_kindergarten_homeroom
      })
    end
    let!(:event_note) do
      EventNote.create!({
        educator: pals.healey_laura_principal,
        student_id: sarah_student.id,
        event_note_type: EventNoteType.SST,
        text: 'blah',
        recorded_at: time_now - 7.days
      })
    end

    it 'works for Sarah to see a note in the feed' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.healey_sarah_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: sarah_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['feed_cards'].size).to eq 1
    end

    it 'guards Vivian reading her student from Sarah\'s worksapce_id' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: vivian_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
    end

    it 'guards Vivian reading Sarah student from her own worksapce_id' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, grade_level_next_year: '1')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: sarah_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
    end

    it 'guards Vivian reading her own student from own other worksapce_id' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, grade_level_next_year: '3')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: vivian_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      json = JSON.parse(response.body)
      expect(response.status).to eq 403
    end
  end
end
