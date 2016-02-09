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
          expect(assigns(:result)).to eq [{ label: "Juan - HEA - 5", value: juan.id }]
        end
      end
      context 'does not match student name' do
        it 'is successful' do
          make_request('j')
          expect(response).to be_success
        end
        it 'returns an empty array' do
          make_request('j')
          expect(assigns(:result)).to eq []
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
end
