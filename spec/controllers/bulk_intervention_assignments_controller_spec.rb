require 'rails_helper'

RSpec.describe BulkInterventionAssignmentsController, type: :controller do
	describe '#create' do
    context 'valid params' do
      context 'one student selected' do
        it 'creates one student intervention' do
        end
        it 'assigns the intervention values correctly' do
        end
      end
      context 'three students' do
        it 'creates three student interventions' do
        end
        it 'assigns the intervention values correctly' do
        end
      end
    end
    context 'invalid params' do
      context 'one student selected' do
        context 'invalid date' do
          it 'returns an error message' do
          end
          it 'does not create an intervention' do
          end
        end
      end
    end
  end
end
