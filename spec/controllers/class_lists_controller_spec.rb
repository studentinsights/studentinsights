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

  # enable feature
  before { @ENABLE_CLASS_LISTS = ENV['ENABLE_CLASS_LISTS'] }
  before { ENV['ENABLE_CLASS_LISTS'] = 'true' }
  after { ENV['ENABLE_CLASS_LISTS'] = @ENABLE_CLASS_LISTS }

  before { request.env['HTTPS'] = 'on' }
  before { request.env['HTTP_ACCEPT'] = 'application/json' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe 'env ENABLE_CLASS_LISTS can disable feature' do
    before do
      ENV['ENABLE_CLASS_LISTS'] = 'false'
      sign_in(pals.healey_sarah_teacher)
    end

    it 'guards writing to teacher_updated_class_list_json' do
      post :teacher_updated_class_list_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        school_id: pals.healey.id,
        grade_level_next_year: '6',
        submitted: false,
        json: { foo: 'bazzzzz' }
      }
      expect(response.status).to eq 403
    end

    it 'guards workspaces_json as an example' do
      get :workspaces_json, params: { format: :json }
      expect(response.status).to eq 403
    end

    it 'guards students_for_grade_level_next_year_json as an example' do
      get :students_for_grade_level_next_year_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        school_id: pals.healey.id,
        grade_level_next_year: '6'
      }
      expect(response.status).to eq 403
    end
  end

  describe '#workspaces_json' do
    it 'shows Sarah her classlist' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, {
        grade_level_next_year: '6',
        created_at: time_now - 4.hours,
        updated_at: time_now - 4.hours,
      })
      sign_in(pals.healey_sarah_teacher)
      get :workspaces_json, params: {
        format: :json
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({
        "workspaces"=>[{
          "workspace_id"=>"foo-workspace-id",
          "revisions_count"=>1,
          "class_list"=>{
            "id"=>class_list.id,
            "workspace_id"=>"foo-workspace-id",
            "grade_level_next_year"=>"6",
            "created_at"=>(time_now - 4.hours).as_json,
            "updated_at"=>(time_now - 4.hours).as_json,
            "submitted"=>false,
            "created_by_educator"=>{
              "id"=>pals.healey_sarah_teacher.id,
              "email"=>"sarah@demo.studentinsights.org",
              "full_name"=>"Teacher, Sarah"
            },
            "school"=>{
              "id"=>pals.healey.id,
              "name"=>"Arthur D Healey"
            }
          }
        }]
      })
    end

    it 'shows Uris Sarah\'s classlist' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.uri)
      get :workspaces_json, params: {
        format: :json
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json['workspaces'].length).to eq 1
    end

    it 'does not show Marcus Sarah\'s classlist' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.west_marcus_teacher)
      get :workspaces_json, params: {
        format: :json
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json).to eq({'workspaces'=>[]})
    end
  end

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

    it 'works for Vivian' do
      request_available_grade_levels_json(pals.healey_vivian_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["grade_levels_next_year"]).to eq(["1"])
      expect(json["schools"].length).to eq 1
      expect(json["schools"][0]["id"]).to eq pals.healey.id
    end

    it 'works for Sarah' do
      request_available_grade_levels_json(pals.healey_sarah_teacher)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["grade_levels_next_year"]).to eq(["6"])
      expect(json["schools"].length).to eq 1
      expect(json["schools"][0]["id"]).to eq pals.healey.id
    end

    it 'works for Laura' do
      request_available_grade_levels_json(pals.healey_laura_principal)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json["grade_levels_next_year"]).to eq(["1", "2", "3", "4", "5", "6"])
      expect(json["schools"].length).to eq 1
      expect(json["schools"][0]["id"]).to eq pals.healey.id
    end

    it 'works for Uri' do
      request_available_grade_levels_json(pals.uri)
      json = JSON.parse(response.body)
      expect(json["grade_levels_next_year"]).to eq(["1", "2", "3", "4", "5", "6"])
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
          FactoryBot.create(:student_with_full_name, {
            last_name: 'Fake',
            grade: grade,
            school: pals.healey,
            homeroom: homeroom
          })
        end
      end
      4.times do
        FactoryBot.create(:student_with_full_name, {
          last_name: 'Fake',
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
      expect(json["educators"].size).to eq 6
      expect(json["students"].length).to eq 4
      expect(json["students"].first.keys).to contain_exactly(*[
        "id",
        "local_id",
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
      ])
    end

    it 'filters out inactive students' do
      inactive_student = FactoryBot.create(:student_with_full_name, {
        last_name: 'Fake',
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
        "is_editable"=>true,
        "class_list"=>{
          "workspace_id"=>"foo-workspace-id",
          "created_by_educator_id"=>pals.healey_sarah_teacher.id,
          "school_id"=>pals.healey.id,
          "grade_level_next_year"=>'6',
          "submitted"=>false,
          "json"=>{'foo'=>'bar'},
          "principal_revisions_json"=>nil
        }
      })
    end

    it 'works for Uri to read Sarah' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      request_class_list_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list']).not_to eq(nil)
      expect(json['is_editable']).to eq false
    end

    it 'works for Laura to read Sarah' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      request_class_list_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list']).not_to eq(nil)
      expect(json['is_editable']).to eq false
    end

    it 'does not allow fetching records outside of authorization' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      request_class_list_json(pals.west_marcus_teacher)
      expect(response.status).to eq 403
    end

    it 'works for Uri to edit his own' do
      create_class_list_from(pals.uri, grade_level_next_year: '3')
      request_class_list_json(pals.uri)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list']).not_to eq(nil)
      expect(json['is_editable']).to eq true
    end
  end

  describe '#teacher_updated_class_list_json' do
    it 'works by creating a new record for each change' do
      create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.healey_sarah_teacher)
      post :teacher_updated_class_list_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        school_id: pals.healey.id,
        grade_level_next_year: '6',
        submitted: false,
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
          "submitted"=>false,
          "json"=>{'foo'=>'bazzzzz'},
          "principal_revisions_json"=>nil
        }
      })
      expect(ClassList.all.size).to eq(2)
      expect(ClassList.last.workspace_id).to eq('foo-workspace-id')
      expect(ClassList.last.json).to eq({'foo'=>'bazzzzz'})
    end
  end

  describe '#principal_revised_class_list_json' do
    def post_principal_revised_class_list_json(educator, params = {})
      sign_in(educator)
      post :principal_revised_class_list_json, params: {
        format: :json,
        workspace_id: 'foo-workspace-id',
        principal_revisions_json: {
          "clientNowMs"=>"1527864543",
          "principalStudentIdsByRoom"=>{
            "room:unplaced"=>[],
            "room:0"=>[1, 2],
            "room:1"=>[3]
          },
          "principalTeacherNamesByRoom"=>{
            "room:0"=>"Kevin",
            "room:1"=>"Alex",
          }
        }
      }.merge(params)
    end

    def allows_post_principal_revised_class_list_json?(class_list, educator, params = {})
      post_principal_revised_class_list_json(educator, workspace_id: class_list.workspace_id)
      response.status != 403
    end

    it 'works by creating a new record for each change' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, {
        grade_level_next_year: '6',
        submitted: true
      })
      post_principal_revised_class_list_json(pals.healey_laura_principal, workspace_id: class_list.workspace_id)
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list'].keys).to contain_exactly(*[
        "workspace_id",
        "created_by_educator_id",
        "school_id",
        "grade_level_next_year",
        "submitted",
        "json",
        "principal_revisions_json"
      ])
      expect(ClassList.all.size).to eq(2)
      expect(ClassList.last.workspace_id).to eq('foo-workspace-id')
      expect(ClassList.last.json).to eq({'foo'=>'bar'})
      expect(ClassList.last.principal_revisions_json.keys).to contain_exactly(*[
        'principalStudentIdsByRoom',
        'principalTeacherNamesByRoom',
        'clientNowMs'
      ])
    end

    it 'ignores other fields' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, {
        grade_level_next_year: '6',
        submitted: true,
        json: { 'legit'=>'value'}
      })
      post_principal_revised_class_list_json(pals.healey_laura_principal, {
        workspace_id: class_list.workspace_id,
        json: { 'sneaky'=>'user'}
      })
      json = JSON.parse(response.body)
      expect(response.status).to eq 200
      expect(json['class_list']['json']).to eq({'legit'=>'value'})
    end

    describe 'enforces authorization rules' do
      let!(:class_list) do
        create_class_list_from(pals.healey_sarah_teacher, {
          grade_level_next_year: '6',
          submitted: true
        })
      end

      it 'does not allow revisions from healey_sarah_teacher' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.healey_sarah_teacher)).to eq false
      end

      it 'does not allow revisions from uri' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.uri)).to eq false
      end

      it 'does not allow revisions from rich_districtwide' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.rich_districtwide)).to eq false
      end
      it 'does not allow revisions from west_marcus_teacher' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.west_marcus_teacher)).to eq false
      end

      it 'does not allow revisions from west_marcus_teacher' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.west_marcus_teacher)).to eq false
      end

      it 'allows revisions from healey_laura_principal' do
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.healey_laura_principal)).to eq true
      end

      it 'does not allow revisions if not yet submitted' do
        class_list.update!(submitted: false)
        expect(allows_post_principal_revised_class_list_json?(class_list, pals.healey_laura_principal)).to eq false
      end
    end
  end

  describe '#profile_json' do
    let!(:sarah_student) do
      FactoryBot.create(:student_with_full_name, {
        grade: '5',
        school: pals.healey,
        homeroom: pals.healey_fifth_homeroom
      })
    end
    let!(:vivian_student) do
      FactoryBot.create(:student_with_full_name, {
        grade: 'KF',
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

    it 'guards Vivian reading her student from Sarah\'s workspace_id' do
      class_list = create_class_list_from(pals.healey_sarah_teacher, grade_level_next_year: '6')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: vivian_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      expect(response.status).to eq 403
    end

    it 'guards Vivian reading Sarah student from her own workspace_id' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, grade_level_next_year: '1')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: sarah_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      expect(response.status).to eq 403
    end

    it 'guards Vivian reading her own student from own other workspace_id' do
      class_list = create_class_list_from(pals.healey_vivian_teacher, grade_level_next_year: '3')
      sign_in(pals.healey_vivian_teacher)
      get :profile_json, params: {
        format: :json,
        workspace_id: class_list.workspace_id,
        student_id: vivian_student.id,
        time_now: time_now.to_i,
        limit: 10
      }
      expect(response.status).to eq 403
    end
  end
end
