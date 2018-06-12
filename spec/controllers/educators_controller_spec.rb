require 'rails_helper'

describe EducatorsController, :type => :controller do
  describe '#homepage' do
    let!(:pals) { TestPals.create! }

    def make_request_for_uri(educator)
      sign_in(educator)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :show, params: { id: pals.uri.id }
      response
    end

    it 'works for districtwide admin' do
      response = make_request_for_uri(pals.uri)
      json = JSON.parse(response.body)
      expect(json).to eq({
        "id"=>999999,
        "email"=>"uri@demo.studentinsights.org",
        "admin"=>true,
        "full_name"=>"Disney, Uri",
        "staff_type"=>"Administrator",
        "schoolwide_access"=>true,
        "grade_level_access"=>[],
        "restricted_to_sped_students"=>false,
        "restricted_to_english_language_learners"=>false,
        "can_view_restricted_notes"=>true,
        "districtwide_access"=>true,
        "school"=>{
          "id"=>pals.healey.id,
          "name"=>"Arthur D Healey"
        },
        "sections"=>[],
        "labels"=>[]
      })
    end

    it 'prevents access for all other users' do
      expect(make_request_for_uri(pals.shs_jodi).status).to eq 403
      expect(make_request_for_uri(pals.healey_vivian_teacher).status).to eq 403
      expect(make_request_for_uri(pals.healey_laura_principal).status).to eq 403
    end
  end

  describe '#my_students_json' do
    def get_my_students(educator)
      request.env['HTTPS'] = 'on'
      sign_in(educator)
      get :my_students_json, params: { format: :json }
      response
    end

    def included_student_ids(response)
      body = JSON.parse!(response.body)
      body['students'].map {|student| student['id'] }
    end

    let!(:pals) { TestPals.create! }

    it 'works for Uri as an example' do
      response = get_my_students(pals.uri)
      expect(response).to be_success
      expect(included_student_ids(response)).to contain_exactly(*Student.all.map(&:id))
    end

    it 'works for Harry as an example, showing he is authorized for 8th graders' do
      response = get_my_students(pals.shs_harry_housemaster)
      expect(response).to be_success
      expect(included_student_ids(response)).to contain_exactly(*[
        pals.shs_freshman_mari.id,
        pals.west_eighth_ryan.id
      ])
    end

    it 'includes 8th grade students for Harry when env is not set, even if he has label' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return(nil)

      response = get_my_students(pals.shs_harry_housemaster)
      expect(response).to be_success
      expect(included_student_ids(response)).to contain_exactly(pals.shs_freshman_mari.id)
    end
  end

  describe '#names_for_dropdown' do
    def make_request(student)
      request.env['HTTPS'] = 'on'
      get :names_for_dropdown, params: { format: :json, id: student.id }
    end

    context 'authorized' do
      let(:json) { JSON.parse!(response.body) }

      before(:each) do
        sign_in FactoryBot.create(:educator)
        make_request(student)
      end

      context 'student has no school' do
        let(:student) { FactoryBot.create(:student) }
        it 'returns an empty array' do
          expect(json).to eq []
        end
      end

      context 'student has school' do
        let(:student) { FactoryBot.create(:student, school: school) }

        context 'educators at school' do
          let(:school) { FactoryBot.create(:healey, :with_educator) }
          it 'returns array of their names' do
            expect(json).to eq ['Stephenson, Neal']
          end
        end

        context 'educators providing services' do
          let(:school) { FactoryBot.create(:healey) }
          let!(:service) {
            FactoryBot.create(:service, provided_by_educator_name: 'Butler, Octavia')
          }

          it 'returns array of their names' do
            make_request(student)
            expect(json).to eq ['Butler, Octavia']
          end
        end

        context 'educators at school and providing services' do
          let(:school) { FactoryBot.create(:healey, :with_educator) }
          let!(:service) {
            FactoryBot.create(:service, provided_by_educator_name: 'Butler, Octavia')
          }

          it 'returns names of both, sorted alphabetically' do
            make_request(student)
            expect(json).to eq ['Butler, Octavia', 'Stephenson, Neal']
          end

          context 'search for "o"' do
            it 'returns Octavia' do
              get :names_for_dropdown, params: { format: :json, id: student.id, term: 'o' }
              expect(json).to eq ['Butler, Octavia']
            end
          end

          context 'search for "s"' do
            it 'returns Stephenson' do
              get :names_for_dropdown, params: { format: :json, id: student.id, term: 's' }
              expect(json).to eq ['Stephenson, Neal']
            end
          end

        end

        context 'no educators at school or providing services' do
          let(:school) { FactoryBot.create(:healey) }
          it 'returns an empty array' do
            expect(json).to eq []
          end
        end

      end
    end

    context 'unauthorized' do
      it 'returns unauthorized' do
        make_request(FactoryBot.create(:student))
        expect(response).to have_http_status(:unauthorized)
      end
    end

  end

  describe '#reset_session_clock' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :reset_session_clock, params: { format: :json }
    end

    context 'educator is not logged in' do
      it 'returns 401 Unauthorized' do
        make_request
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'educator is logged in' do
      before(:each) do
        sign_in FactoryBot.create(:educator)
        make_request
      end
      it 'succeeds' do
        expect(response).to have_http_status(:success)
      end
      it 'resets the session clock' do
        # TODO: Get Devise test helpers like `educator_session`
        # working within the Rspec controller context:
        # expect(educator_session["last_request_at"]).eq Time.now
      end
    end

  end

  describe '#notes_feed' do
    def make_request
      request.env['HTTPS'] = 'on'
      get :notes_feed_json, params: { "batch_size": "60" }
    end

    context 'educator with homeroom' do
      let!(:educator) { FactoryBot.create(:educator_with_homeroom) }
      let!(:event_note) { FactoryBot.create(:event_note, { educator: educator, recorded_at: Date.today }) }

      it 'is able to access the notes feed page' do
        sign_in(educator)
        make_request
        expect(response).to be_success
        body = JSON.parse!(response.body)
        expect(body).to have_key("educators_index")
        expect(body).to have_key("event_note_types_index")
        expect(body).to have_key("current_educator")
        expect(body).to have_key("notes")
        expect(body["notes"].length).to be(1)
        event_note = body["notes"][0]
        expect(event_note).to have_key("id")
        expect(event_note).to have_key("student_id")
        expect(event_note).to have_key("educator_id")
        expect(event_note).to have_key("event_note_type_id")
        expect(event_note).to have_key("recorded_at")
        expect(event_note).to have_key("student")
        expect(event_note["student"]).to have_key("id")
        expect(event_note["student"]).to have_key("first_name")
        expect(event_note["student"]).to have_key("last_name")
        expect(event_note["student"]).to have_key("school_id")
        expect(event_note["student"]).to have_key("school_name")
        expect(event_note["student"]).to have_key("homeroom_id")
        expect(event_note["student"]).to have_key("homeroom_name")
        expect(event_note["student"]).to have_key("grade")
      end
    end
  end
end
