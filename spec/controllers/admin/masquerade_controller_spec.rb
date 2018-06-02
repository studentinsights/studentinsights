require 'rails_helper'

describe Admin::MasqueradeController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }
  let!(:not_allowed_educators) do
    [
      pals.rich_districtwide,
      pals.healey_vivian_teacher,
      pals.healey_ell_teacher,
      pals.healey_sped_teacher,
      pals.healey_laura_principal,
      pals.healey_sarah_teacher,
      pals.west_marcus_teacher,
      pals.shs_jodi,
      pals.shs_bill_nye,
      pals.shs_ninth_grade_counselor,
      pals.shs_hugo_art_teacher,
      pals.shs_fatima_science_teacher,
      pals.shs_harry_housemaster
    ]
  end

  describe '#become' do
    def attempt_become(educator, masquerading_educator_id)
      sign_in(educator)
      post :become, params: { masquerading_educator_id: masquerading_educator_id }
      response
    end

    def expect_become_to_fail(educator, masquerading_educator_id)
      expect(attempt_become(educator, masquerading_educator_id)).to redirect_to('https://test.host/not_authorized')
    end

    def expect_become_to_succeed(educator, masquerading_educator_id)
      response = attempt_become(educator, masquerading_educator_id)

      expect(controller.session['masquerade.masquerading_educator_id']).to eq masquerading_educator_id
      expect(controller.session['warden.user.educator.key']).to eq [[educator.id], nil]
      expect(response).to redirect_to('https://test.host/')
    end

    it 'raises without masquerading_educator_id' do
      sign_in(pals.uri)
      expect { post :become }.to raise_error ActionController::ParameterMissing
    end


    it 'for all combinations of educators, raises unless can_set?' do
      not_allowed_educators.each do |as_educator|
        ([pals.uri] + not_allowed_educators).each do |target_educator|
          expect_become_to_fail(as_educator, target_educator.id)
        end
      end
    end

    it 'for Uri, sets and redirects for all educators' do
      not_allowed_educators.each do |target_educator|
        expect_become_to_succeed(pals.uri, target_educator.id)
      end
    end
  end

  describe '#clear' do
    def expect_clear_to_succeed(educator)
      sign_in(educator)
      post :clear

      expect(controller.session.has_key?('masquerade.masquerading_educator_id')).to eq false
      expect(controller.session['warden.user.educator.key']).to eq [[educator.id], nil]
      expect(response).to redirect_to('https://test.host/')
    end

    # Serialize the session, but omit a tuple that tracks the last request
    # time, since we don't care about that for tests.
    def snapshot_session
      controller.session.as_json.select do |key, value|
        key != 'warden.user.educator.session'
      end
    end

    def expect_clear_to_fail_and_not_change_session(educator)
      sign_in(educator)
      before_session = snapshot_session
      post :clear
      after_session = snapshot_session
      
      expect(before_session).to eq after_session
      expect(response).to redirect_to('https://test.host/not_authorized')
    end

    it 'for all combinations of educators, raises unless can_set?' do
      not_allowed_educators.each do |as_educator|
        expect_clear_to_fail_and_not_change_session(as_educator)
      end
    end

    it 'clears and redirects' do
      controller.session['masquerade.masquerading_educator_id'] = pals.healey_laura_principal.id
      expect_clear_to_succeed(pals.uri)
    end
  end
end