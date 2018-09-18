require 'spec_helper'

RSpec.describe MockLDAP do
  describe '.should_use?' do
    context 'USE_MOCK_LDAP is "false"' do
      before do
        allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return('false')
      end

      it 'returns false' do
        expect(MockLDAP.should_use?).to eq false
      end
    end

    context 'USE_MOCK_LDAP is nil' do
      before do
        allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return(nil)
      end

      it 'returns false' do
        expect(MockLDAP.should_use?).to eq false
      end
    end

    context 'USE_MOCK_LDAP is "true" but no password is set'  do
      before do
        allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return('true')
        allow(ENV).to receive(:[]).with('MOCK_LDAP_PASSWORD').and_return(nil)
      end

      it 'returns false' do
        expect(MockLDAP.should_use?).to eq false
      end
    end

    context 'USE_MOCK_LDAP is "true", password is set (test.rb defaults)'  do
      it 'returns true' do
        expect(MockLDAP.should_use?).to eq true
      end
    end

    context 'DISTRICT_LDAP_HOST is set'  do
      before do
        allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return('true')
        allow(ENV).to receive(:[]).with('MOCK_LDAP_PASSWORD').and_return('password')
        allow(ENV).to receive(:[]).with('DISTRICT_LDAP_HOST').and_return('12345')
      end

      it 'returns false' do
        expect(MockLDAP.should_use?).to eq false
      end
    end

    context 'ENV is production, District Key is not demo' do
      before do
        allow(Rails).to receive(:env).and_return('production')
        allow(ENV).to receive(:[]).with('USE_MOCK_LDAP').and_return('true')
        allow(ENV).to receive(:[]).with('MOCK_LDAP_PASSWORD').and_return('password')
        allow(ENV).to receive(:[]).with('DISTRICT_LDAP_HOST').and_return('12345')
        allow(ENV).to receive(:[]).with('DISTRICT_KEY').and_return('new_bedford')
      end

      it 'returns false' do
        expect(MockLDAP.should_use?).to eq false
      end
    end
  end
end
