require 'rails_helper'

def create_service(student, educator)
  FactoryGirl.create(:service, {
    student: student,
    recorded_by_educator: educator,
    provided_by_educator: educator
  })
end

describe StudentsController, :type => :controller do
  describe '#show' do
    let(:educator) { FactoryGirl.create(:educator_with_homeroom) }
    let(:student) { FactoryGirl.create(:student, :with_risk_level) }
    let(:homeroom) { student.homeroom }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student) }

    def make_request(options = { student_id: nil, format: :html })
      request.env['HTTPS'] = 'on'
      get :show, id: options[:student_id], format: options[:format]
    end

    context 'when educator is not logged in' do
      it 'redirects to sign in page' do
        make_request({ student_id: student.id, format: :html })
        expect(response).to redirect_to(new_educator_session_path)
      end
    end

    context 'when educator is logged in' do

      before { sign_in(educator) }

      context 'educator has schoolwide access' do
        let!(:school) { FactoryGirl.create(:school) }
        let(:educator) { FactoryGirl.create(:educator, :admin )}
        let(:serialized_data) { assigns(:serialized_data) }

        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_success
        end

        it 'assigns the student\'s serialized data correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(serialized_data[:current_educator]).to eq educator
          expect(serialized_data[:student]["id"]).to eq student.id
          expect(serialized_data[:notes]).to eq []

          expect(serialized_data[:feed]).to eq ({
            event_notes: [],
            services: {active: [], discontinued: []},
            deprecated: {notes: [], interventions: []},
            dibels: []
          })

          expect(serialized_data[:chart_data]).to include(:attendance_events_school_years)

          expect(serialized_data[:intervention_types_index]).to eq({
            20 => {:id=>20, :name=>"After-School Tutoring (ATP)"},
            21 => {:id=>21, :name=>"Attendance Officer"},
            22 => {:id=>22, :name=>"Attendance Contract"},
            23 => {:id=>23, :name=>"Behavior Contract"},
            24 => {:id=>24, :name=>"Behavior Plan"},
            25 => {:id=>25, :name=>"Boys & Girls Club"},
            26 => {:id=>26, :name=>"Classroom Academic Intervention"},
            27 => {:id=>27, :name=>"Classroom Behavior Intervention"},
            28 => {:id=>28, :name=>"Community Schools"},
            29 => {:id=>29, :name=>"Counseling: In-House"},
            30 => {:id=>30, :name=>"Counseling: Outside/Physician Referral"},
            31 => {:id=>31, :name=>"ER Referral (Mental Health)"},
            32 => {:id=>32, :name=>"Math Tutor"},
            33 => {:id=>33, :name=>"Mobile Crisis Referral"},
            34 => {:id=>34, :name=>"MTSS Referral"},
            35 => {:id=>35, :name=>"OT/PT Consult"},
            36 => {:id=>36, :name=>"Parent Communication"},
            37 => {:id=>37, :name=>"Parent Conference/Meeting"},
            39 => {:id=>39, :name=>"Peer Mediation"},
            40 => {:id=>40, :name=>"Reading Specialist"},
            41 => {:id=>41, :name=>"Reading Tutor"},
            42 => {:id=>42, :name=>"SST Referral"},
            43 => {:id=>43, :name=>"Weekly Call/Email Home"},
            44 => {:id=>44, :name=>"X Block Tutor"},
            45 => {:id=>45, :name=>"51a Filing"},
            46 => {:id=>46, :name=>"Other "},
          })

          expect(serialized_data[:service_types_index]).to eq({
            502 => {:id=>502, :name=>"Attendance Officer"},
            503 => {:id=>503, :name=>"Attendance Contract"},
            504 => {:id=>504, :name=>"Behavior Contract"},
            505 => {:id=>505, :name=>"Counseling, in-house"},
            506 => {:id=>506, :name=>"Counseling, outside"},
            507 => {:id=>507, :name=>"Reading intervention"},
            508 => {:id=>508, :name=>"Math intervention"},
          })

          expect(serialized_data[:event_note_types_index]).to eq({
            300 => {:id=>300, :name=>"SST Meeting"},
            301 => {:id=>301, :name=>"MTSS Meeting"},
            302 => {:id=>302, :name=>"Parent conversation"},
            304 => {:id=>304, :name=>"Something else"},
          })

          expect(serialized_data[:educators_index]).to eq({
            educator.id => {:id=>educator.id, :email=>educator.email, :full_name=>nil}
          })

          expect(serialized_data[:attendance_data].keys).to eq [
            :discipline_incidents, :tardies, :absences
          ]
        end

        context 'student has multiple discipline incidents' do
          let!(:student) { FactoryGirl.create(:student) }
          let(:most_recent_school_year) { student.most_recent_school_year }
          let(:serialized_data) { assigns(:serialized_data) }
          let(:attendance_data) { serialized_data[:attendance_data] }
          let(:discipline_incidents) { attendance_data[:discipline_incidents] }

          let!(:more_recent_incident) {
            FactoryGirl.create(
              :discipline_incident,
              student_school_year: most_recent_school_year,
              occurred_at: Time.now - 1.day
            )
          }

          let!(:less_recent_incident) {
            FactoryGirl.create(
              :discipline_incident,
              student_school_year: most_recent_school_year,
              occurred_at: Time.now - 2.days
            )
          }

          it 'sets the correct order' do
            make_request({ student_id: student.id, format: :html })
            expect(discipline_incidents).to eq [more_recent_incident, less_recent_incident]
          end
        end

        context 'educator has grade level access' do
          let(:educator) { FactoryGirl.create(:educator, grade_level_access: [student.grade] )}

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'educator has homeroom access' do
          let(:educator) { FactoryGirl.create(:educator) }
          before { homeroom.update(educator: educator) }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'educator does not have schoolwide, grade level, or homeroom access' do
          let(:educator) { FactoryGirl.create(:educator) }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end

        context 'educator has schoolwide access but grade_level_access is nil' do
          let(:educator) { FactoryGirl.create(:educator, {
            grade_level_access: nil,
            schoolwide_access: true,
            restricted_to_sped_students: false
          }) }

          it 'succeeds without an exception' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'educator has some grade level access but for the wrong grade' do
          let(:student) { FactoryGirl.create(:student, :with_risk_level, grade: '1') }
          let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['KF']) }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end

        context 'educator access restricted to SPED students' do
          let(:educator) { FactoryGirl.create(:educator,
                                              grade_level_access: ['1'],
                                              restricted_to_sped_students: true ) }

          context 'student in SPED' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               program_assigned: 'Sp Ed') }

            it 'is successful' do
              make_request({ student_id: student.id, format: :html })
              expect(response).to be_success
            end
          end

          context 'student in Reg Ed' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               program_assigned: 'Reg Ed') }

            it 'fails' do
              make_request({ student_id: student.id, format: :html })
              expect(response).to redirect_to(not_authorized_path)
            end
          end

        end

        context 'educator access restricted to ELL students' do
          let(:educator) { FactoryGirl.create(:educator,
                                              grade_level_access: ['1'],
                                              restricted_to_english_language_learners: true ) }

          context 'limited English proficiency' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               limited_english_proficiency: 'FLEP') }

            it 'is successful' do
              make_request({ student_id: student.id, format: :html })
              expect(response).to be_success
            end
          end

          context 'fluent in English' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               limited_english_proficiency: 'Fluent') }

            it 'fails' do
              make_request({ student_id: student.id, format: :html })
              expect(response).to redirect_to(not_authorized_path)
            end
          end

        end

      end

    end

  end

  describe '#event_note' do
    def make_post_request(student, event_note_params = {})
      request.env['HTTPS'] = 'on'
      post :event_note, format: :json, id: student.id, event_note: event_note_params
    end

    context 'admin educator logged in' do
      let(:educator) { FactoryGirl.create(:educator, :admin) }
      let!(:student) { FactoryGirl.create(:student) }
      let!(:event_note_type) { EventNoteType.first }

      before do
        sign_in(educator)
      end

      context 'valid request' do
        let(:post_params) {
          {
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'foo'
          }
        }
        it 'creates a new event note' do
          expect { make_post_request(student, post_params) }.to change(EventNote, :count).by 1
        end
        it 'responds with json' do
          make_post_request(student, post_params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          expect(JSON.parse(response.body).keys).to eq [
            'id',
            'student_id',
            'educator_id',
            'event_note_type_id',
            'text',
            'recorded_at'
          ]
        end
      end

      context 'with explicit educator_id' do
        it 'ignores the educator_id' do
          make_post_request(student, {
            educator_id: 350,
            student_id: student.id,
            event_note_type_id: event_note_type.id,
            recorded_at: Time.now,
            text: 'foo'
          })
          response_body = JSON.parse(response.body)
          expect(response_body['educator_id']).to eq educator.id
          expect(response_body['educator_id']).not_to eq 350
        end
      end

      context 'fails with missing params' do
        it 'ignores the educator_id' do
          make_post_request(student, { text: 'foo' })
          expect(response.status).to eq 422
          response_body = JSON.parse(response.body)
          expect(response_body).to eq({
            "errors" => [
              "Student can't be blank",
              "Event note type can't be blank"
            ]
          })
        end
      end
    end
  end

  describe '#service' do
    def make_post_request(student, service_params = {})
      request.env['HTTPS'] = 'on'
      post :service, format: :json, id: student.id, service: service_params
    end

    context 'admin educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator, :admin) }
      let!(:provided_by_educator) { FactoryGirl.create(:educator) }
      let!(:student) { FactoryGirl.create(:student) }

      before do
        sign_in(educator)
      end

      context 'when valid request' do
        let!(:post_params) do
          {
            student_id: student.id,
            service_type_id: 503,
            date_started: '2016-02-22',
            provided_by_educator_id: provided_by_educator.id
          }
        end

        it 'creates a new service' do
          expect { make_post_request(student, post_params) }.to change(Service, :count).by 1
        end

        it 'responds with JSON' do
          make_post_request(student, post_params)
          expect(response.status).to eq 200
          make_post_request(student, post_params)
          expect(response.headers["Content-Type"]).to eq 'application/json; charset=utf-8'
          expect(JSON.parse(response.body).keys).to contain_exactly(
            'id',
            'student_id',
            'provided_by_educator_id',
            'recorded_by_educator_id',
            'service_type_id',
            'recorded_at',
            'date_started',
            'discontinued_by_educator_id',
            'discontinued_recorded_at'
          )
        end
      end

      context 'when recorded_by_educator_id' do
        it 'ignores the educator_id' do
          make_post_request(student, {
            student_id: student.id,
            service_type_id: 503,
            date_started: '2016-02-22',
            provided_by_educator_id: provided_by_educator.id,
            recorded_by_educator_id: 350
          })
          response_body = JSON.parse(response.body)
          expect(response_body['recorded_by_educator_id']).to eq educator.id
          expect(response_body['recorded_by_educator_id']).not_to eq 350
        end
      end

      context 'when missing params' do
        it 'fails with error messages' do
          make_post_request(student, { text: 'foo' })
          expect(response.status).to eq 422
          response_body = JSON.parse(response.body)
          expect(response_body).to eq({
            "errors" => [
              "Provided by educator can't be blank",
              "Student can't be blank",
              "Service type can't be blank",
              "Date started can't be blank"
            ]
          })
        end
      end
    end
  end

  describe '#names' do
    def make_request(query)
      request.env['HTTPS'] = 'on'
      get :names, q: query, format: :json
    end

    context 'admin educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator, :admin) }
      before { sign_in(educator) }
      context 'query matches student name' do
        let(:healey) { FactoryGirl.create(:healey) }
        let!(:juan) { FactoryGirl.create(:student, first_name: 'Juan', school: healey, grade: '5') }
        let!(:jacob) { FactoryGirl.create(:student, first_name: 'Jacob', grade: '5') }

        it 'is successful' do
          make_request('j')
          expect(response).to be_success
        end
        it 'returns student name and id' do
          make_request('j')
          expect(assigns(:sorted_results)).to eq [{ label: "Juan - HEA - 5", value: juan.id }]
        end
      end
      context 'does not match student name' do
        it 'is successful' do
          make_request('j')
          expect(response).to be_success
        end
        it 'returns an empty array' do
          make_request('j')
          expect(assigns(:sorted_results)).to eq []
        end
      end
    end
    context 'educator without authorization to students' do
      let!(:educator) { FactoryGirl.create(:educator) }
      before { sign_in(educator) }
      context 'query matches student name' do
        let(:healey) { FactoryGirl.create(:healey) }
        let!(:juan) { FactoryGirl.create(:student, first_name: 'Juan', school: healey, grade: '5') }
        it 'returns an empty array' do
          make_request('j')
          expect(assigns(:sorted_results)).to eq []
        end
      end
    end
    context 'educator not logged in' do
      it 'is not successful' do
        make_request('j')
        expect(response.status).to eq 401
        expect(response.body).to include "You need to sign in before continuing."
      end
    end
  end

  describe '#serialize_student_for_profile' do
    it 'returns a hash with the additional keys that UI code expects' do
      student = FactoryGirl.create(:student)
      serialized_student = controller.send(:serialize_student_for_profile, student)
      expect(serialized_student.keys).to include(*[
        'student_risk_level',
        'absences_count',
        'tardies_count',
        'school_name',
        'homeroom_name',
        'discipline_incidents_count'
      ])
    end
  end

  describe '#calculate_student_score' do
    context 'happy path' do
      let(:search_tokens) { ['don', 'kenob'] }
      it 'is 0.0 when no matches' do
        result = controller.send(:calculate_student_score, Student.new(first_name: 'Mickey', last_name: 'Mouse'), search_tokens)
        expect(result).to eq 0.0
      end

      it 'is 0.5 when first name only matches' do
        result = controller.send(:calculate_student_score, Student.new(first_name: 'Donald', last_name: 'Mouse'), search_tokens)
        expect(result).to eq 0.5
      end

      it 'is 0.5 when last name only matches' do
        result = controller.send(:calculate_student_score, Student.new(first_name: 'zzz', last_name: 'Kenobiliiii'), search_tokens)
        expect(result).to eq 0.5
      end

      it 'is 1.0 when both names match' do
        result = controller.send(:calculate_student_score, Student.new(first_name: 'Donald', last_name: 'Kenobi'), search_tokens)
        expect(result).to eq 1.0
      end
    end

    it 'works for bug test case' do
      search_tokens = ['al','p']
      aladdin_score = controller.send(:calculate_student_score, Student.new(first_name: 'Aladdin', last_name: 'Poppins'), search_tokens)
      pluto_score = controller.send(:calculate_student_score, Student.new(first_name: 'Pluto', last_name: 'Poppins'), search_tokens)
      expect(aladdin_score).to be > pluto_score
      expect(aladdin_score).to eq 1
      expect(pluto_score).to eq 0.5
    end
  end

  describe '#student_feed' do
    let(:student) { FactoryGirl.create(:student) }
    let(:educator) { FactoryGirl.create(:educator, :admin) }
    let!(:service) { create_service(student, educator) }

    it 'returns services' do
      feed = controller.send(:student_feed, student)
      expect(feed.keys).to eq([:event_notes, :services, :deprecated, :dibels])
      expect(feed[:services].keys).to eq [:active, :discontinued]
      expect(feed[:services][:active].first[:id]).to eq service.id
    end

    context 'after service is discontinued' do
      before do
        DiscontinuedService.create!({
          service_id: service.id,
          recorded_by_educator_id: educator.id,
          recorded_at: Time.now
        })
      end
      it 'filters it' do
        feed = controller.send(:student_feed, student)
        expect(feed[:services][:active].size).to eq 0
        expect(feed[:services][:discontinued].first[:id]).to eq service.id
      end
    end
  end

end
