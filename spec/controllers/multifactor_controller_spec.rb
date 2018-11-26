require 'rails_helper'

describe MultifactorController, :type => :controller do
  let!(:pals) { TestPals.create! }

  def post_send_code(params = {})
    request.env['HTTPS'] = 'on'
    request.env['HTTP_ACCEPT'] = 'application/json'
    post :send_code, params: { format: :json }.merge(params)
    response
  end

  describe '#send_code, with consistent timing disabled' do
    before { LoginTests.before_disable_consistent_timing! }
    after { LoginTests.after_reenable_consistent_timing! }

    it 'always returns the same value regardless of execution path' do
      [nil, '', 'foo-login', 'uri@demo.studentinsights.org', 'jodi@studentinsights.org', 'invalid-login'].each do |login_text|
        post_send_code(multifactor: { login_text: 'foo' })
        expect(response.status).to eq 201
        expect(JSON.parse(response.body)).to eq({'status' => 'ok'})
      end
    end

    it 'calls send_login_code_via_sms! for Uri' do
      fake_authenticator = MultifactorAuthenticator.new(pals.uri)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).to receive(:send_login_code_via_sms!)

      post_send_code(multifactor: { login_text: 'uri@demo.studentinsights.org' })
      expect(response.status).to eq 201
    end

    it 'calls send_login_code_via_sms! for Rich' do
      fake_authenticator = MultifactorAuthenticator.new(pals.rich_districtwide)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).to receive(:send_login_code_via_sms!)

      post_send_code(multifactor: { login_text: 'rich@demo.studentinsights.org' })
      expect(response.status).to eq 201
    end

    it 'does not call send_login_code_via_sms! for Jodi, as one example' do
      fake_authenticator = MultifactorAuthenticator.new(pals.shs_jodi)
      allow(MultifactorAuthenticator).to receive(:new).and_return(fake_authenticator)
      expect(fake_authenticator).not_to receive(:send_login_code_via_sms!)

      post_send_code(multifactor: { login_text: 'jodi@demo.studentinsights.org' })
      expect(response.status).to eq 201
    end

    it 'fails when already signed in' do
      request.env['HTTPS'] = 'on'
      sign_in(pals.uri)

      request.env['HTTP_ACCEPT'] = 'application/json'
      post :send_code, params: {
        format: :json,
        multifactor: { login_text: 'uri@demo.studentinsights.org' }
      }
      expect(response.status).to eq 403
      expect(JSON.parse(response.body)).to eq({'error' => 'unauthorized'})
    end
  end
end
