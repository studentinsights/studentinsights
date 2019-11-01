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
        "id"=>pals.uri.id,
        "email"=>"uri@demo.studentinsights.org",
        "admin"=>true,
        "full_name"=>"Disney, Uri",
        "active?"=>true,
        "missing_from_last_export"=>false,
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
        "labels"=>[
          'can_upload_student_voice_surveys',
          'should_show_levels_shs_link',
          'enable_reading_benchmark_data_entry',
          'enable_reflection_on_notes_patterns',
          'profile_enable_minimal_reading_data',
          'enable_equity_experiments',
          'enable_reading_debug',
          'enable_viewing_educators_with_access_to_student'
        ]
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
      expect(response).to be_successful
      expect(included_student_ids(response)).to contain_exactly(*Student.all.map(&:id))
      json = JSON.parse!(response.body)
      expect(json['students'].flat_map(&:keys).uniq).to contain_exactly(*[
        'id',
        'first_name',
        'last_name',
        'has_photo',
        'grade',
        'homeroom',
        'house',
        'counselor',
        'program_assigned',
        'school',
        'sped_liaison',
        'sped_placement'
      ])
    end

    it 'works for Harry as an example with dev setup' do
      response = get_my_students(pals.shs_harry_housemaster)
      expect(response).to be_successful
      expect(included_student_ids(response)).to contain_exactly(*[
        pals.shs_freshman_mari.id,
        pals.shs_freshman_amir.id,
        pals.shs_senior_kylo.id
      ])
    end

    it 'works for Harry as an example, showing he is authorized for 8th graders when HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return('true')

      response = get_my_students(pals.shs_harry_housemaster)
      expect(response).to be_successful
      expect(included_student_ids(response)).to contain_exactly(*[
        pals.west_eighth_ryan.id,
        pals.shs_freshman_mari.id,
        pals.shs_freshman_amir.id,
        pals.shs_senior_kylo.id
      ])
    end

    it 'does not include 8th grade students for Harry when env is not set, even if he has label' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8').and_return(nil)

      response = get_my_students(pals.shs_harry_housemaster)
      expect(response).to be_successful
      expect(included_student_ids(response)).to contain_exactly(*[
        pals.shs_freshman_mari.id,
        pals.shs_freshman_amir.id,
        pals.shs_senior_kylo.id
      ])
    end
  end

  describe '#services_json' do
    def get_services_json(educator)
      request.env['HTTPS'] = 'on'
      sign_in(educator)
      get :services_json, params: { format: :json }
      response
    end

    let!(:pals) { TestPals.create! }

    it 'works for Uri as an example' do
      FactoryBot.create(:service, student: pals.shs_freshman_mari)
      response = get_services_json(pals.uri)
      expect(response).to be_successful
      expect(JSON.parse!(response.body)['services'].first.keys).to contain_exactly(*[
        'id',
        'date_started',
        'discontinued_at',
        'discontinued_by_educator_id',
        'estimated_end_date',
        'service_type',
        'service_type_id',
        'service_upload_id',
        'student',
        'student_id',
        'provided_by_educator_name',
        'recorded_at',
        'recorded_by_educator_id',
        'created_at',
        'updated_at'
      ])
    end

    it 'guards authorization, testing with Laura' do
      FactoryBot.create(:service, student: pals.shs_freshman_mari)
      response = get_services_json(pals.healey_laura_principal)
      expect(response).to be_successful
      expect(JSON.parse!(response.body)['services']).to eq []
    end
  end

  describe '#student_searchbar_json' do
    let(:school) { FactoryBot.create(:healey) }

    def make_request
      request.env['HTTPS'] = 'on'
      get :student_searchbar_json, params: { format: :json }
    end

    context 'admin educator logged in, no cached student names' do
      let!(:educator) { FactoryBot.create(:educator, :admin, school: school) }
      before { sign_in(educator) }
      let!(:juan) {
        FactoryBot.create(
          :student, first_name: 'Juan', last_name: 'P', school: school, grade: '5'
        )
      }

      let!(:jacob) {
        FactoryBot.create(:student, first_name: 'Jacob', grade: '5')
      }

      it 'returns an array of student labels and ids that match educator\'s students' do
        make_request
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to eq [
          { "label" => "Juan P - HEA - 5", "id" => juan.id }
        ]
      end
    end

    context 'admin educator logged in, cached student names on EducatorSearchbar record' do
      let!(:educator) do
        FactoryBot.create(
          :educator, :admin,
          school: school
        )
      end
      let!(:educator_searchbar) do
        EducatorSearchbar.create!({
          educator: educator,
          student_searchbar_json: "[{\"label\":\"Juan P - HEA - 5\",\"id\":\"700\"}]"
        })
      end
      before { sign_in(educator) }

      it 'returns an array of student labels and ids that match cached students on EducatorSearchbar record' do
        make_request
        expect(response).to be_successful
        expect(JSON.parse(response.body)).to eq [
          { "label" => "Juan P - HEA - 5", "id" => "700" }
        ]
      end
    end

    context 'educator without authorization to students' do
      let!(:educator) { FactoryBot.create(:educator) }
      before { sign_in(educator) }
      let(:healey) { FactoryBot.create(:healey) }
      let!(:juan) { FactoryBot.create(:student, first_name: 'Juan', school: healey, grade: '5') }

      it 'returns an empty array' do
        make_request
        expect(JSON.parse(response.body)).to eq []
      end
    end

    context 'educator not logged in' do
      it 'is not successful' do
        make_request
        expect(response.status).to eq 401
        expect(response.body).to include "You need to sign in before continuing."
      end
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
        expect(response.status).to eq(401)
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
        expect(response.status).to eq(401)
      end
    end

    context 'educator is logged in' do
      it 'succeeds' do
        sign_in FactoryBot.create(:educator)
        make_request
        expect(response).to be_successful
      end
    end
  end

  describe '#probe' do
    let!(:pals) { TestPals.create! }

    def make_request
      request.env['HTTPS'] = 'on'
      get :probe, params: { format: :json }
    end

    context 'educator is not logged in' do
      it 'returns 401 Unauthorized' do
        make_request
        expect(response.status).to eq(401)
      end
    end

    context 'educator is logged in' do
      it 'returns time left in session' do
        Timecop.freeze(pals.time_now) do
          sign_in FactoryBot.create(:educator)
          make_request
        end
        expect(response).to be_successful

        # The Devise Session doesn't get mocked properly in test,
        # and this seems complex and brittle, so this just verifies
        # the shape.  Changes here require manual testing (esp. for
        # interactions between concurrent tabs).
        expect(JSON.parse(response.body)).to eq({
          'status' => 'ok',
          'remaining_seconds' => 0 # just verifying the shape
        })
      end
    end
  end

  describe '#my_notes_json' do
    let!(:pals) { TestPals.create! }

    def make_request
      request.env['HTTPS'] = 'on'
      get :my_notes_json, params: { format: :json, 'batch_size': '60' }
    end

    it 'redacts restricted note content' do
      educator = pals.healey_laura_principal
      note = FactoryBot.create(:event_note, {
        student: pals.healey_kindergarten_student,
        educator: educator,
        text: 'DANGEROUS_restricted',
        is_restricted: true,
        recorded_at: Date.today - 4.years
      })
      sign_in(educator)
      make_request

      expect(response).to be_successful
      json = JSON.parse(response.body)
      expect(response.body).not_to include('DANGEROUS')
      mixed_note = json['mixed_event_notes'].first
      expect(mixed_note['id']).to eq(note.id)
      expect(mixed_note['text']).to eq('<redacted>')
    end

    context 'educator with homeroom' do
      let!(:educator) { pals.healey_laura_principal }
      let!(:ryan_event_note) { FactoryBot.create(:event_note, { student: pals.west_eighth_ryan, educator: educator, recorded_at: Date.today - 4.years }) }
      let!(:garfield_event_note) { FactoryBot.create(:event_note, { student: pals.healey_kindergarten_student, educator: educator, recorded_at: Date.today }) }

      it 'can access notes they wrote for current students, but not past students' do
        sign_in(educator)
        make_request
        expect(response).to be_successful
        body = JSON.parse!(response.body)
        expect(body.keys).to contain_exactly(*[
          'mixed_event_notes',
          'current_educator',
          'total_notes_count'
        ])
        expect(body['total_notes_count']).to eq 1
        expect(body['mixed_event_notes'].map {|n| n['id'] }).to eq([garfield_event_note.id])
        mixed_event_note = body['mixed_event_notes'].first
        expect(mixed_event_note.keys).to contain_exactly(*[
          'id',
          'student_id',
          'educator_id',
          'event_note_type_id',
          'text',
          'recorded_at',
          'is_restricted',
          'event_note_revisions_count',
          'latest_revision_at',
          'attachments',
          'educator',
          'student'
        ])
        expect(mixed_event_note['student'].keys).to contain_exactly(*[
          'id',
          'first_name',
          'last_name',
          'grade',
          'house',
          'has_photo',
          'homeroom',
          'school'
        ])
      end

      it 'guards when not signed in' do
        make_request
        expect(response.status).to eq 401
      end
    end
  end
end
