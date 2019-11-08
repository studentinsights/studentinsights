RSpec.describe 'LDAPAuthenticator' do
  def test_tls_options_text
    '{"tls_foo": "tls_bar"}'
  end

  def test_options(ldap_login, ldap_password)
    {
      :auth => {
        :method=>:simple,
        :username=>ldap_login,
        :password=>ldap_password
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

  def expect_bind_not_to_be_called
    spy_ldap = MockLDAP.new(test_options(nil, nil)) # invalid, so if methods are called it will raise
    allow(MockLDAP).to receive(:new).with(anything).and_return(spy_ldap)
    expect(spy_ldap).not_to receive(:bind)
  end

  describe '#is_authorized_by_ldap? using MockLDAP' do
    def is_authorized_by_ldap?(ldap_login, ldap_password)
      LDAPAuthenticator.new(ldap_class: MockLDAP).is_authorized_by_ldap?(ldap_login, ldap_password)
    end

    let!(:pals) { TestPals.create! }

    it 'allows correct credentials' do
      expect(is_authorized_by_ldap?('uri@demo.studentinsights.org', 'demo-password')).to eq true
    end

    it 'guards invalid password' do
      expect(is_authorized_by_ldap?('uri@demo.studentinsights.org', 'wrong-password')).to eq false
    end

    it 'guards empty password, without network call' do
      expect_bind_not_to_be_called
      expect(is_authorized_by_ldap?('uri@demo.studentinsights.org', '')).to eq false
    end

    it 'guards nil password, without network call' do
      expect_bind_not_to_be_called
      expect(is_authorized_by_ldap?('uri@demo.studentinsights.org', nil)).to eq false
    end

    it 'guards empty login, without network call' do
      expect_bind_not_to_be_called
      expect(is_authorized_by_ldap?('', 'demo-password')).to eq false
    end

    it 'guards nil login, without network call' do
      expect_bind_not_to_be_called
      expect(is_authorized_by_ldap?(nil, 'demo-password')).to eq false
    end
  end

  describe '#ldap_options_for' do
    before do
      allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return(nil)
      allow(ENV).to receive(:[]).with('DISTRICT_LDAP_HOST').and_return('foo.com')
      allow(ENV).to receive(:[]).with('DISTRICT_LDAP_PORT').and_return('12345.com')
      allow(ENV).to receive(:[]).with('DISTRICT_LDAP_ENCRYPTION_TLS_OPTIONS_JSON').and_return(test_tls_options_text)
      allow(ENV).to receive(:[]).with('DISTRICT_LDAP_TIMEOUT_IN_SECONDS').and_return('30')
   end

    it 'respects environment variables' do
      expect(LDAPAuthenticator.new.send(:ldap_options_for, 'foo', 'bar')).to eq({
        :auth => {
          :method=>:simple,
          :username=>"foo",
          :password=>"bar"
        },
        :connect_timeout => 30,
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
end
