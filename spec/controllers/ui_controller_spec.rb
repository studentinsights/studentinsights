require 'rails_helper'

describe UiController, :type => :controller do
  let!(:pals) { TestPals.create! }

  def make_request
    request.env['HTTPS'] = 'on'
    get :ui
  end

  describe '#ui' do
    it 'renders minimal json shape inline' do
      sign_in(pals.uri)
      make_request
      expect(response.status).to eq 200
      expect(assigns(:serialized_data).deep_stringify_keys).to eq({
        "current_educator" => {
          "id" => pals.uri.id,
          "admin" => true,
          "school_id" => pals.healey.id,
          "labels" => [
            'can_upload_student_voice_surveys',
            'enable_equity_experiments',
            'enable_reader_profile_january',
            'enable_reader_profile_june',
            'enable_reading_benchmark_data_entry',
            'enable_reading_debug',
            'enable_reflection_on_notes_patterns',
            'enable_viewing_educators_with_access_to_student',
            'profile_enable_minimal_reading_data',
            'should_show_levels_shs_link'
          ]
        }
      }.deep_stringify_keys)
    end

    it 'correctly sets labels' do
      sign_in(pals.shs_bill_nye)
      make_request
      expect(response.status).to eq 200
      expect(assigns(:serialized_data).deep_stringify_keys).to eq({
        "current_educator" => {
          "id" => pals.shs_bill_nye.id,
          "admin" => false,
          "school_id" => pals.shs.id,
          "labels" => [
            'should_show_levels_shs_link',
            'should_show_low_grades_box',
            'shs_experience_team'
          ]
        }
      }.deep_stringify_keys)
    end
  end
end
