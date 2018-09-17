RSpec.describe PerDistrict do
  # Preserve global app config
  before { @district_key = ENV['DISTRICT_KEY'] }
  after { ENV['DISTRICT_KEY'] = @district_key }

  def for_somerville
    PerDistrict.new(district_key: PerDistrict::SOMERVILLE)
  end

  def for_new_bedford
    PerDistrict.new(district_key: PerDistrict::NEW_BEDFORD)
  end

  def for_bedford
    PerDistrict.new(district_key: PerDistrict::BEDFORD)
  end

  def for_demo
    PerDistrict.new(district_key: PerDistrict::DEMO)
  end

  describe '#initialize' do
    it 'raises if no district_key' do
      ENV['DISTRICT_KEY'] = ''
      expect { PerDistrict.new }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe '#district_key' do
    it 'works' do
      expect(for_somerville.district_key).to eq 'somerville'
      expect(for_new_bedford.district_key).to eq 'new_bedford'
    end
  end

  describe '#email_from_educator_import_row' do
    it 'works' do
      expect(for_somerville.email_from_educator_import_row(login_name: 'foo')).to eq('foo@k12.somerville.ma.us')
      expect(for_new_bedford.email_from_educator_import_row(login_name: 'foo')).to eq('foo@newbedfordschools.org')
      expect(for_bedford.email_from_educator_import_row(login_name: 'foo', email: 'bar@bedfordps.org')).to eq('bar@bedfordps.org')
      expect(for_demo.email_from_educator_import_row(login_name: 'foo')).to eq('foo@demo.studentinsights.org')
      expect { PerDistrict.new(district_key: 'wat').from_import_login_name_to_email('foo') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe '#import_student_photos?' do
    it 'only works in Somerville' do
      expect(for_somerville.import_student_photos?).to eq(true)
      expect(for_new_bedford.import_student_photos?).to eq(false)
      expect(for_demo.import_student_photos?).to eq(false)
    end
  end

  describe '#find_educator_by_login_text' do
    it 'works for Somerville' do
      pals = TestPals.create!(email_domain: 'k12.somerville.ma.us')
      expect(for_somerville.find_educator_by_login_text('uri@k12.somerville.ma.us')).to eq(pals.uri)
    end

    it 'works for New Bedford' do
      pals = TestPals.create!(email_domain: 'newbedfordschools.org')
      expect(for_new_bedford.find_educator_by_login_text('uri@newbedfordschools.org')).to eq(pals.uri)
    end

    it 'works for Bedford' do
      pals = TestPals.create!(email_domain: 'bedfordps.org')
      expect(for_bedford.find_educator_by_login_text('uri')).to eq(pals.uri)
    end

    it 'works for demo' do
      pals = TestPals.create!
      expect(for_demo.find_educator_by_login_text('uri@demo.studentinsights.org')).to eq(pals.uri)
    end
  end

  describe '#ldap_login_for_educator' do
    it 'works for Somerville' do
      pals = TestPals.create!(email_domain: 'k12.somerville.ma.us')
      expect(for_somerville.ldap_login_for_educator(pals.uri)).to eq('uri@k12.somerville.ma.us')
    end

    it 'works for New Bedford' do
      pals = TestPals.create!(email_domain: 'newbedfordschools.org')
      expect(for_new_bedford.ldap_login_for_educator(pals.uri)).to eq('uri@newbedfordschools.org')
    end

    it 'works for Bedford' do
      pals = TestPals.create!(email_domain: 'bedfordps.org')
      expect(for_bedford.ldap_login_for_educator(pals.uri)).to eq('uri@bedford.k12.ma.us')
    end

    it 'works for demo' do
      pals = TestPals.create!
      expect { for_demo.ldap_login_for_educator(pals.uri) }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe 'integration test for LDAP methods' do
    def ldap_login(per_district, email_domain, login_text)
      TestPals.create!(email_domain: email_domain)
      educator = per_district.find_educator_by_login_text(login_text)
      per_district.ldap_login_for_educator(educator)
    end

    it 'works for Somerville' do
      expect(ldap_login(for_somerville, 'k12.somerville.ma.us', 'uri@k12.somerville.ma.us')).to eq('uri@k12.somerville.ma.us')
    end

    it 'works for New Bedford' do
      expect(ldap_login(for_new_bedford, 'newbedfordschools.org', 'uri@newbedfordschools.org')).to eq('uri@newbedfordschools.org')
    end

    it 'works for Bedford' do
      expect(ldap_login(for_bedford, 'bedfordps.org', 'uri')).to eq('uri@bedford.k12.ma.us')
    end

    it 'works for demo' do
      expect { ldap_login(for_demo, 'demo.studentinsights.org', 'uri') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end
end
