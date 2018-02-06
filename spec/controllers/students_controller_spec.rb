require 'rails_helper'

def create_service(student, educator)
  FactoryGirl.create(:service, {
    student: student,
    recorded_by_educator: educator,
    provided_by_educator_name: 'Muraki, Mari'
  })
end

def create_event_note(student, educator)
  FactoryGirl.create(:event_note, {
    student: student,
    educator: educator,
  })
end

describe StudentsController, :type => :controller do
  let!(:pals) { TestPals.create! }

  describe '#show' do
    let!(:school) { FactoryGirl.create(:school) }
    let(:educator) { FactoryGirl.create(:educator_with_homeroom) }
    let(:other_educator) { FactoryGirl.create(:educator, full_name: "Teacher, Louis") }
    let(:student) { FactoryGirl.create(:student, :with_risk_level, school: school) }
    let(:course) { FactoryGirl.create(:course, school: school) }
    let(:section) { FactoryGirl.create(:section, course: course) }
    let!(:ssa) { FactoryGirl.create(:student_section_assignment, student: student, section: section) }
    let!(:esa) { FactoryGirl.create(:educator_section_assignment, educator: other_educator, section: section)}
    let(:homeroom) { student.homeroom }

    def make_request(options = { student_id: nil, format: :html })
      request.env['HTTPS'] = 'on'
      get :show, params: {
        id: options[:student_id],
        format: options[:format]
      }
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
          expect(serialized_data[:student]["restricted_notes_count"]).to eq 0

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
            509 => {:id=>509, :name=>"SomerSession"},
            510 => {:id=>510, :name=>"Summer Program for English Language Learners"},
            511 => {:id=>511, :name=>"Afterschool Tutoring"},
            512 => {:id=>512, :name=>"Freedom School"},
            513 => {:id=>513, :name=>"Community Schools"},
            514 => {:id=>514, :name=>"X-Block"},
          })

          expect(serialized_data[:event_note_types_index].keys).to match_array([
            300, 301, 302, 304, 305, 306
          ])

          expect(serialized_data[:event_note_types_index].values).to match_array([
            {:id=>300, :name=>"SST Meeting"},
            {:id=>301, :name=>"MTSS Meeting"},
            {:id=>302, :name=>"Parent conversation"},
            {:id=>304, :name=>"Something else"},
            {:id=>305, :name=>"9th Grade Experience"},
            {:id=>306, :name=>"10th Grade Experience"},
          ])

          expect(serialized_data[:educators_index]).to include({
            educator.id => {:id=>educator.id, :email=>educator.email, :full_name=>nil}
          })

          expect(serialized_data[:attendance_data].keys).to eq [
            :discipline_incidents, :tardies, :absences
          ]

          expect(serialized_data[:sections].length).to equal(1)
          expect(serialized_data[:sections][0]["id"]).to eq(section.id)
          expect(serialized_data[:sections][0]["grade_numeric"]).to eq(ssa.grade_numeric)
          expect(serialized_data[:sections][0]["educators"][0]["full_name"]).to eq(other_educator.full_name)
          expect(serialized_data[:current_educator_allowed_sections]).to include(section.id)
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
              student: student,
              occurred_at: Time.now - 1.day
            )
          }

          let!(:less_recent_incident) {
            FactoryGirl.create(
              :discipline_incident,
              student: student,
              occurred_at: Time.now - 2.days
            )
          }

          it 'sets the correct order' do
            make_request({ student_id: student.id, format: :html })
            expect(discipline_incidents).to eq [more_recent_incident, less_recent_incident]
          end
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

      context 'educator has section access' do
        let!(:educator) { FactoryGirl.create(:educator, school: school)}
        let!(:course) { FactoryGirl.create(:course, school: school)}
        let!(:section) { FactoryGirl.create(:section) }
        let!(:esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: section) }
        let!(:section_student) { FactoryGirl.create(:student, school: school) }
        let!(:ssa) { FactoryGirl.create(:student_section_assignment, student: section_student, section: section) }

        it 'is successful' do
          make_request({ student_id: section_student.id, format: :html })
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
                                            school: school )
        }

        context 'student in SPED' do
          let(:student) { FactoryGirl.create(:student,
                                              :with_risk_level,
                                              grade: '1',
                                              program_assigned: 'Sp Ed',
                                              school: school)
          }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'student in Reg Ed' do
          let(:student) { FactoryGirl.create(:student,
                                              :with_risk_level,
                                              grade: '1',
                                              program_assigned: 'Reg Ed')
          }

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
                                            school: school )
        }

        context 'limited English proficiency' do
          let(:student) { FactoryGirl.create(:student,
                                              :with_risk_level,
                                              grade: '1',
                                              limited_english_proficiency: 'FLEP',
                                              school: school)
          }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end
        end

        context 'fluent in English' do
          let(:student) { FactoryGirl.create(:student,
                                              :with_risk_level,
                                              grade: '1',
                                              limited_english_proficiency: 'Fluent')
          }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end
      end
    end
  end

  describe '#service' do
    def make_post_request(student, service_params = {})
      request.env['HTTPS'] = 'on'
      post :service, params: {
        format: :json,
        id: student.id,
        service: service_params
      }
    end

    # Returns a list of all students that the educator
    # can post a service for and get a 200 back.
    def can_post_service_for(educator, students)
      allowed_students = []

      sign_in(educator)
      students.each do |student|
        make_post_request(student, {
          student_id: student.id,
          service_type_id: 503,
          date_started: '2016-02-22',
          provided_by_educator_id: educator.id
        })
        allowed_students << student if response.status == 200
      end
      sign_out(educator)

      allowed_students
    end

    context 'enforces authorization rules' do
      let(:students) do
        [
          pals.healey_kindergarten_student,
          pals.healey_meredith_student,
          pals.shs_freshman_mari
        ]
      end

      it { expect(can_post_service_for(pals.uri, students)).to eq students }
      it { expect(can_post_service_for(pals.healey_vivian_teacher, students)).to eq [pals.healey_kindergarten_student] }
      it { expect(can_post_service_for(pals.healey_ell_teacher, students)).to eq [] }
      it { expect(can_post_service_for(pals.healey_sped_teacher, students)).to eq [] }
      it { expect(can_post_service_for(pals.healey_laura_principal, students)).to eq [pals.healey_kindergarten_student, pals.healey_meredith_student] }
      it { expect(can_post_service_for(pals.healey_sarah_teacher, students)).to eq [pals.healey_meredith_student] }
      it { expect(can_post_service_for(pals.west_marcus_teacher, students)).to eq [] }
      it { expect(can_post_service_for(pals.shs_jodi, students)).to eq [pals.shs_freshman_mari] }
      it { expect(can_post_service_for(pals.shs_bill_nye, students)).to eq [pals.shs_freshman_mari] }
      it { expect(can_post_service_for(pals.shs_ninth_grade_counselor, students)).to eq [pals.shs_freshman_mari] }
      it { expect(can_post_service_for(pals.shs_hugo_art_teacher, students)).to eq [] }
      it { expect(can_post_service_for(pals.shs_fatima_science_teacher, students)).to eq [] }
    end

    context 'admin educator logged in' do
      let!(:school) { FactoryGirl.create(:school) }
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
            'discontinued_recorded_at',
            'estimated_end_date'
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
          make_post_request(student, { text: 'foo', student_id: student.id })
          expect(response.status).to eq 422
          response_body = JSON.parse(response.body)
          expect(response_body).to eq({
            "errors" => [
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

    def make_request
      request.env['HTTPS'] = 'on'
      get :names, params: { format: :json }
    end

    context 'admin educator logged in, no cached student names' do
      let!(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
      before { sign_in(educator) }
      let!(:juan) {
        FactoryGirl.create(
          :student, first_name: 'Juan', last_name: 'P', school: school, grade: '5'
        )
      }

      let!(:jacob) {
        FactoryGirl.create(:student, first_name: 'Jacob', grade: '5')
      }

      it 'returns an array of student labels and ids that match educator\'s students' do
        make_request
        expect(response).to be_success
        expect(JSON.parse(response.body)).to eq [
          { "label" => "Juan P - HEA - 5", "id" => juan.id }
        ]
      end
    end

    context 'admin educator logged in, cached student names' do
      let!(:educator) {
        FactoryGirl.create(
          :educator, :admin,
          school: school,
          student_searchbar_json: "[{\"label\":\"Juan P - HEA - 5\",\"id\":\"700\"}]"
        )
      }
      before { sign_in(educator) }

      it 'returns an array of student labels and ids that match cached students' do
        make_request
        expect(response).to be_success
        expect(JSON.parse(response.body)).to eq [
          { "label" => "Juan P - HEA - 5", "id" => "700" }
        ]
      end

    end

    context 'educator without authorization to students' do
      let!(:educator) { FactoryGirl.create(:educator) }
      before { sign_in(educator) }
      let(:healey) { FactoryGirl.create(:healey) }
      let!(:juan) { FactoryGirl.create(:student, first_name: 'Juan', school: healey, grade: '5') }

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

  describe '#serialize_student_for_profile' do
    it 'returns a hash with the additional keys that UI code expects' do
      student = FactoryGirl.create(:student)
      restricted_notes_count = 2
      serialized_student = controller.send(:serialize_student_for_profile, student, restricted_notes_count)
      expect(serialized_student.keys).to include(*[
        'student_risk_level',
        'absences_count',
        'tardies_count',
        'school_name',
        'school_type',
        'restricted_notes_count',
        'homeroom_name',
        'discipline_incidents_count'
      ])
    end
  end

  describe '#student_feed' do
    let(:student) { FactoryGirl.create(:student) }
    let(:educator) { FactoryGirl.create(:educator, :admin) }
    let!(:service) { create_service(student, educator) }
    let!(:event_notes) { [create_event_note(student, educator)] }

    it 'returns services' do
      feed = controller.send(:student_feed, student, event_notes)
      expect(feed.keys).to eq([:event_notes, :services, :deprecated])
      expect(feed[:services].keys).to eq [:active, :discontinued]
      expect(feed[:services][:discontinued].first[:id]).to eq service.id
    end

    it 'returns event notes' do
      feed = controller.send(:student_feed, student, event_notes)
      actual_event_notes = feed[:event_notes]

      expect(actual_event_notes.size).to eq 1
      expect(actual_event_notes.first[:student_id]).to eq(student.id)
      expect(actual_event_notes.first[:educator_id]).to eq(educator.id)
    end

    context 'after service is discontinued' do
      it 'filters it' do
        feed = controller.send(:student_feed, student, event_notes)
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
      get :restricted_notes, params: { id: student.id }
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

  describe '#student_report' do
    let(:educator) { FactoryGirl.create(:educator, :admin, school: school) }
    let(:school) { FactoryGirl.create(:school) }
    let(:student) { FactoryGirl.create(:student, :with_risk_level, school: school) }

    def make_request(student_id, options = {})
      request.env['HTTPS'] = 'on'
      get :student_report, params: {
        id: student_id,
        disable_js: true,
        format: :pdf,
        from_date: '08/15/2015',
        to_date: '03/16/2017'
      }.merge(options)
    end

    context 'when educator is not logged in' do
      it 'does not render a student report' do
        make_request(student.id)
        expect(response.status).to eq 401
      end
    end

    context 'when educator is logged in' do
      context 'educator has schoolwide access' do

        it 'is successful' do
          sign_in(educator)
          make_request(student.id)
          expect(response).to be_success
        end

        it 'assigns the student correctly' do
          sign_in(educator)
          make_request(student.id)
          expect(assigns(:student)).to eq student
        end

        it 'assigns the student\'s services correctly with full history' do
          old_service = FactoryGirl.create(:service, date_started: '2012-02-22', student: student, discontinued_at: '2012-05-21')
          recent_service = FactoryGirl.create(:service, date_started: '2016-01-13', student: student, discontinued_at: nil)
          sign_in(educator)
          make_request(student.id)
          expect(assigns(:services)).not_to include(old_service)
          expect(assigns(:services)).to include(recent_service)
        end

        it 'assigns the student\'s notes correctly excluding restricted notes' do
          restricted_note = FactoryGirl.create(:event_note, :restricted, student: student, educator: educator)
          note = FactoryGirl.create(:event_note, student: student, educator: educator)
          sign_in(educator)
          make_request(student.id)
          expect(assigns(:event_notes)).to include(note)
          expect(assigns(:event_notes)).not_to include(restricted_note)
        end

        it 'assigns the student\'s school years correctly' do
          incident = FactoryGirl.create(:discipline_incident, student: student, occurred_at: '2015-08-15')
          absence = FactoryGirl.create(:absence, student: student, occurred_at: '2015-08-16')
          tardy = FactoryGirl.create(:tardy, student: student, occurred_at: '2015-08-17')
          make_request({ student_id: student.id, format: :pdf, from_date: '08/15/2015', to_date: '03/16/2017' })

          expect(assigns(:student_school_years)[0].discipline_incidents).to include(incident)
          expect(assigns(:student_school_years)[0].absences).to include(absence)
          expect(assigns(:student_school_years)[0].tardies).to include(tardy)
        end

        it 'assigns the student\'s discipline incidents correctly' do
          incident = FactoryGirl.create(:discipline_incident, student: student, occurred_at: '2015-08-15')
          old_incident = FactoryGirl.create(:discipline_incident, student: student, occurred_at: '2015-08-14')
          make_request({ student_id: student.id, format: :pdf, from_date: '08/15/2015', to_date: '03/16/2017' })

          expect(assigns(:discipline_incidents)).to include(incident)
          expect(assigns(:discipline_incidents)).not_to include(old_incident)
        end

        it 'assigns the student\'s assesments correctly' do
          assessment = FactoryGirl.create(:assessment, :access)
          student_assessment = FactoryGirl.create(:access, student: student, assessment: assessment, date_taken: '2016-08-16')
          assessment = FactoryGirl.create(:assessment, :math, :star)
          student_assessment = FactoryGirl.create(:star_math_assessment, student: student, assessment: assessment, date_taken: '2017-02-16')
          make_request({ student_id: student.id, format: :pdf, from_date: '08/15/2015', to_date: '03/16/2017' })

          expect(assigns(:student_assessments)).to include("ACCESS Composite")
          expect(assigns(:student_assessments)["ACCESS Composite"]).to be_kind_of(Array)
          expect(assigns(:student_assessments)["ACCESS Composite"]).to eq([["2016-08-16 00:00:00 UTC", nil]])
          expect(assigns(:student_assessments)).to include("STAR Mathematics Percentile")
          expect(assigns(:student_assessments)["STAR Mathematics Percentile"]).to be_kind_of(Array)
          expect(assigns(:student_assessments)["STAR Mathematics Percentile"]).to eq([["2017-02-16 00:00:00 UTC", nil]])
        end
      end
    end
  end
end
