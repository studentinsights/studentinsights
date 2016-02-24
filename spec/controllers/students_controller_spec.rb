require 'rails_helper'

describe StudentsController, :type => :controller do
  let(:educator) { FactoryGirl.create(:educator_with_homeroom) }

  describe '#show' do
    let(:student) { FactoryGirl.create(:student, :with_risk_level) }
    let(:homeroom) { student.homeroom }
    let!(:student_school_year) { FactoryGirl.create(:student_school_year, student: student) }

    def make_request(options = { student_id: nil, format: :html })
      request.env['HTTPS'] = 'on'
      get :show, id: options[:student_id], format: options[:format]
    end

    context 'when educator is not logged in' do
      context 'html' do
        it 'redirects to sign in page' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to redirect_to(new_educator_session_path)
        end
      end
      context 'csv' do
        it 'sends a 401 unauthorized' do
          make_request({ student_id: student.id, format: :csv })
          expect(response.status).to eq 401
          expect(response.body).to eq "You need to sign in before continuing."
        end
      end
    end

    context 'when educator is logged in' do

      before { sign_in(educator) }

      context 'educator has schoolwide access' do
        let!(:school) { FactoryGirl.create(:school) }
        let(:educator) { FactoryGirl.create(:educator, :admin )}

        context 'html' do

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_success
          end

          it 'assigns the student correctly' do
            make_request({ student_id: student.id, format: :html })
            expect(assigns(:student)).to eq student
          end

          it 'assigns the student school year correctly' do
            make_request({ student_id: student.id, format: :html })
            expect(assigns(:student_school_years)).to eq student.student_school_years
          end

        end

        context 'csv' do

          it 'is successful' do
            make_request({ student_id: student.id, format: :csv })
            expect(response).to be_success
          end
          it 'assigns the student correctly' do
            make_request({ student_id: student.id, format: :csv })
            expect(assigns(:student)).to eq student
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

    context 'educator logged in' do
      let!(:educator) { FactoryGirl.create(:educator) }
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
            'recorded_at',
            'created_at',
            'updated_at'
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

  describe '#names' do
    def make_request(query)
      request.env['HTTPS'] = 'on'
      get :names, q: query, format: :json
    end

    context 'educator logged in' do
      before do
        sign_in(educator)
      end
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
        'interventions',
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
end
