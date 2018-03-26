RSpec.describe 'LdapAuthenticatableTiny' do
  def set_env
    ENV['DISTRICT_LDAP_HOST'] = 'foo.com'
    ENV['DISTRICT_LDAP_PORT'] = '12345'
    ENV['DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON'] = test_tls_options_text
  end

  def test_strategy
    warden_env = nil
    Devise::Strategies::LdapAuthenticatableTiny.new(warden_env)
  end

  def test_tls_options_text
    '{"tls_foo": "tls_bar"}'
  end

  def test_options(login, password)
    {
      :auth => {
        :method=>:simple,
        :username=>login,
        :password=>password
      },
      :encryption => {
        :method=>:simple_tls,
        :tls_options=>{
          :tls_foo => 'tls_bar'
        }
      },
      :host => 'foo.com',
      :port => 12345
    }
  end

  describe '#authenticate! when methods are mocked' do
    let!(:pals) { TestPals.create! }

    it 'calls fail when email not found' do
      strategy = test_strategy
      allow(strategy).to receive(:authentication_hash) { { email: 'foo@demo.studentinsights.org' } }
      strategy.authenticate!

      expect(strategy.result).to eq :failure
      expect(strategy.message).to eq :not_found_in_database
      expect(strategy.user).to eq nil
    end

    it 'calls fail when email found but not is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive(:authentication_hash) { { email: 'uri@demo.studentinsights.org' } }
      allow(strategy).to receive(:password) { 'supersecure' }
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'supersecure').and_return false

      strategy.authenticate!
      expect(strategy.result).to eq :failure
      expect(strategy.message).to eq :invalid
      expect(strategy.user).to eq nil
    end

    it 'calls success! when valid Educator and is_authorized_by_ldap?' do
      strategy = test_strategy
      allow(strategy).to receive(:authentication_hash) { { email: 'uri@demo.studentinsights.org' } }
      allow(strategy).to receive(:password) { 'supersecure' }
      allow(strategy).to receive(:is_authorized_by_ldap?).with('uri@demo.studentinsights.org', 'supersecure').and_return true
      strategy.authenticate!

      expect(strategy.result).to eq :success
      expect(strategy.message).to eq nil
      expect(strategy.user).to eq pals.uri
    end
  end

  describe '#ldap_options_for' do
    before { set_env }

    it 'respects environment variables' do
      strategy = test_strategy
      expect(strategy.send(:ldap_options_for, 'foo', 'bar')).to eq({
        :auth => {
          :method=>:simple,
          :username=>"foo",
          :password=>"bar"
        },
        :encryption => {
          :method=>:simple_tls,
          :tls_options=>{
            :tls_foo => 'tls_bar'
          }
        },
        :host => 'foo.com',
        :port => 12345
      })
    end
  end

  describe '#is_authorized_by_ldap? calls Net::LDAP correctly' do
    before { set_env }

    it 'returns false and locks for invalid credentials' do
      mock_ldap = instance_double(Net::LDAP)
      expect(mock_ldap).to receive(:bind) { false }
      expect(mock_ldap).to receive(:get_operation_result) { 'result-error-message' }
      expect(Net::LDAP).to receive(:new).and_return(mock_ldap)

      strategy = test_strategy
      expect(strategy.send(:is_authorized_by_ldap?, 'foo', 'bar')).to eq false
    end

    it 'returns true for valid credentials' do
      mock_ldap = instance_double(Net::LDAP)
      expect(mock_ldap).to receive(:bind) { true }
      expect(Net::LDAP).to receive(:new).and_return(mock_ldap)

      strategy = test_strategy
      expect(strategy.send(:is_authorized_by_ldap?, 'foo', 'bar')).to eq true
    end
  end
end
