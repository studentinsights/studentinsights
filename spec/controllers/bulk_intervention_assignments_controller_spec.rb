require 'rails_helper'

RSpec.describe BulkInterventionAssignmentsController, type: :controller do

  def make_request(params = {})
    request.env['HTTPS'] = 'on'
    xhr :get, :create, params  # AJAX
  end

	describe '#create' do
    before { make_request(params) }
    let!(:student) { FactoryGirl.create(:student) }
    context 'valid params' do
      context 'one student selected' do
        let(:params) {
          { bulk_intervention_assignment: {
            student_ids: [student.id],
            intervention_type_id: '1',
            comment: 'Useful comment!',
            end_date: '2020/1/1',
            educator_id: '1' }
          }
        }
        it 'creates one student intervention' do
          expect(Intervention.count).to eq 1
        end
        it 'assigns the intervention values correctly' do
          intervention = assigns(:interventions)[0]
          expect(intervention.comment).to eq 'Useful comment!'
        end
      end
      context 'two students' do
        let(:other_student) { FactoryGirl.create(:student_we_want_to_update) }
        let(:params) {
          { bulk_intervention_assignment: {
            student_ids: [student.id, other_student.id],
            intervention_type_id: '1',
            end_date: '2020/1/1',
            educator_id: '1',
            goal: 'Fix the situation.' }
          }
        }
        it 'creates two student interventions' do
          expect(assigns(:interventions).size).to eq 2
          expect(Intervention.count).to eq 2
        end
        it 'assigns the intervention values correctly' do
          intervention = assigns(:interventions)[0]
          expect(intervention.goal).to eq 'Fix the situation.'
        end
      end
    end
    context 'invalid params' do
      context 'for one student' do
        context 'invalid date' do
          let(:params) {
            { bulk_intervention_assignment: {
              student_ids: [student.id],
              intervention_type_id: '1',
              end_date: 'Halloween' }
            }
          }
          it 'returns a detailed error message' do
            expect(assigns(:message)).to eq "invalid date"
          end
          it 'does not create any interventions' do
            expect(Intervention.count).to eq 0
          end
        end
        context 'missing intervention type' do
          let(:params) { { bulk_intervention_assignment: { student_ids: [student.id] } } }
          it 'returns a detailed error message' do
            expect(assigns(:message)).to eq "Validation failed: Intervention type can't be blank"
          end
          it 'does not create any interventions' do
            expect(Intervention.count).to eq 0
          end
        end
      end
      context 'more than one student selected' do
        context 'one student id does not correspond to student' do
          let(:params) { {
            bulk_intervention_assignment: {
              student_ids: [1, "Q"],
              intervention_type_id: '1' }
            }
          }
          it 'returns a detailed error message' do
            expect(assigns(:message)).to eq "Couldn't find Student with 'id'=1"
          end
          it 'does not create any interventions' do
            expect(Intervention.count).to eq 0
          end
        end
      end
    end
  end
end
