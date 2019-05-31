require 'rails_helper'

describe EquityController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  before { request.env['HTTP_ACCEPT'] = 'application/json' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#stats_by_school_json' do
    it 'guards access' do
      sign_in(pals.healey_sarah_teacher)
      get :stats_by_school_json, params: {
        format: :json
      }
      expect(response.status).to eq 403
    end

    it 'passes smoke test' do
      sign_in(pals.uri)
      get :stats_by_school_json, params: {
        format: :json
      }
    end
  end

  describe '#classlists_equity_index_json' do
    def create_class_list_from(educator, params = {})
      ClassList.create!({
        workspace_id: 'foo-workspace-id',
        created_by_teacher_educator_id: educator.id,
        school_id: educator.school_id,
        list_type_text: 'homerooms',
        json: { foo: 'bar' }
      }.merge(params))
    end

    it 'guards access' do
      create_class_list_from(pals.healey_sarah_teacher, {
        grade_level_next_year: '6',
        created_at: time_now - 4.hours,
        updated_at: time_now - 4.hours,
      })
      sign_in(pals.healey_sarah_teacher)
      get :classlists_equity_index_json, params: {
        format: :json
      }
      expect(response.status).to eq 403
    end

    it 'passes smoke test on happy path' do
      create_class_list_from(pals.healey_sarah_teacher, {
        grade_level_next_year: '6',
        created_at: time_now - 4.hours,
        updated_at: time_now - 4.hours,
      })
      sign_in(pals.uri)
      get :classlists_equity_index_json, params: {
        format: :json
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to eq(['dimension_keys', 'class_lists_with_dimensions'])
    end
  end
end
