require 'rails_helper'

describe StudentsController, :type => :controller do
  let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
  let!(:educator_without_homeroom) { FactoryGirl.create(:educator) }

  describe '#show' do
    let(:student) { FactoryGirl.create(:student, :with_risk_level) }
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

      it 'assigns the school year' do
        make_request({ student_id: student.id, format: :html })
        expect(assigns(:student_school_years)).to eq [student_school_year]
      end

      context 'html' do
        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_success
        end
        it 'assigns the student correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(assigns(:student)).to eq student
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
        let!(:juan) { FactoryGirl.create(:student, first_name: 'Juan', school: healey, grade: '05') }

        it 'is successful' do
          make_request('j')
          expect(response).to be_success
        end
        it 'returns student name and id' do
          make_request('j')
          expect(assigns(:result)).to eq [{ label: "Juan - HEA - 05", value: juan.id }]
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
