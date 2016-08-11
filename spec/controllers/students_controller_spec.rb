require 'rails_helper'

def create_service(student, educator)
  FactoryGirl.create(:service, {
    student: student,
    recorded_by_educator: educator,
    provided_by_educator_name: 'Muraki, Mari'
  })
end

describe StudentsController, :type => :controller do

  describe '#show' do
    let!(:school) { FactoryGirl.create(:school) }
    let(:educator) { FactoryGirl.create(:educator_with_homeroom) }
    let(:student) { FactoryGirl.create(:student, :with_risk_level, school: school) }
    let(:homeroom) { student.homeroom }
    let!(:student_school_year) {
      student.student_school_years.first || StudentSchoolYear.create!(
        student: student, school_year: SchoolYear.first_or_create!
      )
    }

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
        let(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
        let(:serialized_data) { assigns(:serialized_data) }

        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_success
        end

        it 'assigns the student\'s serialized data correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(serialized_data[:current_educator]).to eq educator
          expect(serialized_data[:student]["id"]).to eq student.id
          expect(serialized_data[:dibels]).to eq []
          expect(serialized_data[:feed]).to eq ({
            event_notes: [],
            services: {active: [], discontinued: []},
            deprecated: {interventions: []}
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
          let!(:student) { FactoryGirl.create(:student, school: school) }
          let(:most_recent_school_year) { student.most_recent_school_year }
          let(:serialized_data) { assigns(:serialized_data) }
          let(:attendance_data) { serialized_data[:attendance_data] }
          let(:discipline_incidents) { attendance_data[:discipline_incidents] }

          let!(:more_recent_incident) {
            FactoryGirl.create(
              :discipline_incident,
              student_school_year: student.student_school_years.first,
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
          let(:educator) { FactoryGirl.create(:educator, grade_level_access: [student.grade], school: school )}

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'educator has homeroom access' do
          let(:educator) { FactoryGirl.create(:educator, school: school) }
          before { homeroom.update(educator: educator) }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'educator does not have schoolwide, grade level, or homeroom access' do
          let(:educator) { FactoryGirl.create(:educator, school: school) }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end

        context 'educator has some grade level access but for the wrong grade' do
          let(:student) { FactoryGirl.create(:student, :with_risk_level, grade: '1', school: school) }
          let(:educator) { FactoryGirl.create(:educator, grade_level_access: ['KF'], school: school) }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end

        context 'educator access restricted to SPED students' do
          let(:educator) { FactoryGirl.create(:educator,
                                              grade_level_access: ['1'],
                                              restricted_to_sped_students: true,
                                              school: school ) }

          context 'student in SPED' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               program_assigned: 'Sp Ed',
                                               school: school) }

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
                                              restricted_to_english_language_learners: true,
                                              school: school ) }

          context 'limited English proficiency' do
            let(:student) { FactoryGirl.create(:student,
                                               :with_risk_level,
                                               grade: '1',
                                               limited_english_proficiency: 'FLEP',
                                               school: school) }

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

  describe '#service' do
    let!(:school) { FactoryGirl.create(:school) }

    def make_post_request(student, service_params = {})
      request.env['HTTPS'] = 'on'
      post :service, format: :json, id: student.id, service: service_params
    end

    context 'admin educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
      let!(:provided_by_educator) { FactoryGirl.create(:educator, school: school) }
      let!(:student) { FactoryGirl.create(:student, school: school) }

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
            'provided_by_educator_name',
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
    let(:school) { FactoryGirl.create(:healey) }

    def make_request(query)
      request.env['HTTPS'] = 'on'
      get :names, q: query, format: :json
    end

    context 'admin educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
      before { sign_in(educator) }
      context 'query matches student name' do
        let!(:juan) { FactoryGirl.create(:student, first_name: 'Juan', school: school, grade: '5') }
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
      expect(feed.keys).to eq([:event_notes, :services, :deprecated])
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

  describe '#restricted_notes' do
    let!(:school) { FactoryGirl.create(:school) }
    let(:educator) { FactoryGirl.create(:educator_with_homeroom) }
    let(:student) { FactoryGirl.create(:student, school: school) }

    def make_request(student)
      request.env['HTTPS'] = 'on'
      get :restricted_notes, id: student.id
    end

    context 'when educator is logged in' do
      before { sign_in(educator) }

      context 'educator cannot view restricted notes' do
        let(:educator) { FactoryGirl.create(:educator, :admin, can_view_restricted_notes: false, school: school) }

        it 'is not successful' do
          make_request(student)
          expect(response).to redirect_to(not_authorized_path)
        end
      end

      context 'educator can view restricted notes but is not authorized for student' do
        let(:educator) { FactoryGirl.create(:educator, schoolwide_access: false, can_view_restricted_notes: true, school: school) }

        it 'is not successful' do
          make_request(student)
          expect(response).to redirect_to(not_authorized_path)
        end
      end

      context 'educator can view restricted notes' do
        let(:educator) { FactoryGirl.create(:educator, :admin, can_view_restricted_notes: true, school: school) }

        it 'is successful' do
          make_request(student)
          expect(response).to be_success
        end
      end
    end
  end

  describe '#sped_referral' do
    let(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
    let(:school) { FactoryGirl.create(:school) }
    let(:service) { FactoryGirl.create(:service, student: student) }
    let(:student) { FactoryGirl.create(:student, :with_risk_level, school: school) }
    let(:student_school_year) { FactoryGirl.create(:student_school_year, student: student) }

    def make_request(options = { student_id: nil, format: :pdf })
      request.env['HTTPS'] = 'on'
      get :sped_referral, id: options[:student_id], format: options[:format]
    end

    context 'when educator is not logged in' do
      it 'does not render a SPED referral' do
        make_request({ student_id: student.id, format: :pdf })
        expect(response.status).to eq 401
      end
    end

    context 'when educator is logged in' do
      before do
        sign_in(educator)
        make_request({ student_id: student.id, format: :pdf })
      end

      context 'educator has schoolwide access' do

        it 'is successful' do
          expect(response).to be_success
        end

        it 'assigns the student correctly' do
          expect(assigns(:student)).to eq student
        end

        it 'assigns the student\'s services correctly' do
          expect(assigns(:services)).to eq student.services
        end

        it 'assigns the student\'s school years correctly' do
          expect(assigns(:student_school_years)).to eq student.student_school_years
        end
      end
    end
  end

end
