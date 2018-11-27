require 'rails_helper'

describe MultifactorController, :type => :controller do
  let!(:pals) { TestPals.create! }

  def post_multifactor(params = {})
    request.env['HTTPS'] = 'on'
    request.env['HTTP_ACCEPT'] = 'application/json'
    post :multifactor, params: { format: :json }.merge(params)
    response
  end

  describe '#multifactor, with consistent timing disabled' do
    before { LoginTests.before_disable_consistent_timing! }
    after { LoginTests.after_reenable_consistent_timing! }

    it 'requires multifactor param' do
      expect { post_multifactor({}) }.to raise_error ActionController::ParameterMissing
    end

    it 'requires login_text param' do
      expect { post_multifactor(multifactor: {}) }.to raise_error ActionController::ParameterMissing
    end

    it 'always returns the same value regardless of execution path' do
      [nil, '', 'foo-login', 'uri@demo.studentinsights.org', 'jodi@studentinsights.org', 'invalid-login'].each do |login_text|
        post_multifactor(multifactor: { login_text: login_text })
        expect(response.status).to eq 204
      end
    end

    it 'calls send_login_code_if_necessary! for Uri' do
      fake_authenticator = MultifactorAuthenticator.new(pals.uri)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).to receive(:send_login_code_if_necessary!)

      post_multifactor(multifactor: { login_text: 'uri@demo.studentinsights.org' })
      expect(response.status).to eq 204
    end

    it 'calls send_login_code_if_necessary! for Rich' do
      fake_authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).to receive(:send_login_code_if_necessary!)

      post_multifactor(multifactor: { login_text: 'rich@demo.studentinsights.org' })
      expect(response.status).to eq 204
    end

    it 'does not call send_login_code_if_necessary! for Jodi, as one example' do
      fake_authenticator = MultifactorAuthenticator.new(pals.shs_jodi)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).not_to receive(:send_login_code_if_necessary!)

      post_multifactor(multifactor: { login_text: 'jodi@demo.studentinsights.org' })
      expect(response.status).to eq 204
    end

    it 'fails when already signed in' do
      request.env['HTTPS'] = 'on'
      sign_in(pals.uri)

      request.env['HTTP_ACCEPT'] = 'application/json'
      post :multifactor, params: {
        format: :json,
        multifactor: { login_text: 'uri@demo.studentinsights.org' }
      }
      expect(response.status).to eq 403
      expect(JSON.parse(response.body)).to eq({'error' => 'unauthorized'})
    end
  end
end
