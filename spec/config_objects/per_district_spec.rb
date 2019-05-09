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
    it 'works for Somerville, username or email' do
      pals = TestPals.create!(email_domain: 'k12.somerville.ma.us')
      expect(for_somerville.find_educator_by_login_text('uri')).to eq(pals.uri)
      expect(for_somerville.find_educator_by_login_text('uri@k12.somerville.ma.us')).to eq(pals.uri)
    end

    it 'works for New Bedford, username or email' do
      pals = TestPals.create!(email_domain: 'newbedfordschools.org')
      expect(for_new_bedford.find_educator_by_login_text('uri')).to eq(pals.uri)
      expect(for_somerville.find_educator_by_login_text('uri@newbedfordschools.org')).to eq(pals.uri)
    end

    it 'works for Bedford, username-only' do
      pals = TestPals.create!(email_domain: 'bedfordps.org')
      expect(for_bedford.find_educator_by_login_text('uri')).to eq(pals.uri)
      expect(for_somerville.find_educator_by_login_text('uri@bedford.k12.ma.us')).to eq(nil)
    end

    it 'works for demo, username or email' do
      pals = TestPals.create!
      expect(for_demo.find_educator_by_login_text('uri')).to eq(pals.uri)
      expect(for_somerville.find_educator_by_login_text('uri@demo.studentinsights.org')).to eq(pals.uri)
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
      expect(for_demo.ldap_login_for_educator(pals.uri)).to eq('uri@demo.studentinsights.org')
    end
  end

  describe 'integration test for LDAP methods' do
    def ldap_login(per_district, login_text)
      educator = per_district.find_educator_by_login_text(login_text)
      return nil if educator.nil?
      per_district.ldap_login_for_educator(educator)
    end

    it 'works for Somerville, username or email' do
      TestPals.create!(email_domain: 'k12.somerville.ma.us')
      expect(ldap_login(for_somerville, 'uri')).to eq('uri@k12.somerville.ma.us')
      expect(ldap_login(for_somerville, 'uri@k12.somerville.ma.us')).to eq('uri@k12.somerville.ma.us')
    end

    it 'works for New Bedford, username or email' do
      TestPals.create!(email_domain: 'newbedfordschools.org')
      expect(ldap_login(for_new_bedford, 'uri')).to eq('uri@newbedfordschools.org')
      expect(ldap_login(for_new_bedford, 'uri@newbedfordschools.org')).to eq('uri@newbedfordschools.org')
    end

    it 'works for Bedford, username only' do
      TestPals.create!(email_domain: 'bedfordps.org')
      expect(ldap_login(for_bedford, 'uri')).to eq('uri@bedford.k12.ma.us')
      expect(ldap_login(for_bedford, 'uri@bedford.k12.ma.us')).to eq(nil)
    end

    it 'works for demo, username or email' do
      TestPals.create!(email_domain: 'demo.studentinsights.org')
      expect(ldap_login(for_demo, 'uri')).to eq('uri@demo.studentinsights.org')
      expect(ldap_login(for_demo, 'uri@demo.studentinsights.org')).to eq('uri@demo.studentinsights.org')
    end
  end

  describe '#current_quarter' do
    it 'works for Somerville in school year 2018-2019' do
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 8, 17))).to eq 'SUMMER'
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 10, 2))).to eq 'Q1'
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 11, 26))).to eq 'Q2'
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 2, 26))).to eq 'Q3'
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 6, 1))).to eq 'Q4'
      expect(PerDistrict.new.current_quarter(DateTime.new(2018, 6, 24))).to eq 'SUMMER'
    end

    it 'works for demo but raises for Bedford and New Bedford' do
      expect { for_demo.current_quarter(Time.now) }.not_to raise_error
      expect { for_bedford.current_quarter(Time.now) }.to raise_error
      expect { for_new_bedford.current_quarter(Time.now) }.to raise_error
    end
  end

  describe '#parse_counselor_during_import' do
    it 'works' do
      expect(for_somerville.parse_counselor_during_import('Robinson, Kevin')).to eq 'Robinson'
      expect(for_bedford.parse_counselor_during_import('Kevin Robinson')).to eq 'Robinson'
      expect { for_new_bedford.parse_counselor_during_import('Kevin Robinson') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe '#parse_sped_liaison_during_import' do
    it 'works' do
      expect(for_somerville.parse_sped_liaison_during_import('N/a')).to eq 'N/a'
      expect(for_bedford.parse_sped_liaison_during_import('N/a')).to eq nil
    end
  end

  describe '#choose_assessment_importer_row_class' do
    it 'works for Somerville' do
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'MCAS')).to eq McasRow
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'ACCESS')).to eq AccessRow
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'WIDA')).to eq AccessRow
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'WIDA-ACCESS')).to eq AccessRow
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'DIBELS')).to eq DibelsRow
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'wat')).to eq nil
      expect(for_somerville.choose_assessment_importer_row_class(assessment_test: 'W-APT')).to eq nil
    end

    it 'works for Bedford' do
      expect(for_bedford.choose_assessment_importer_row_class(assessment_test: 'MCAS Gr 8 Math')).to eq McasRow
      expect(for_bedford.choose_assessment_importer_row_class(assessment_test: 'MCAS Gr 10 ELA')).to eq McasRow
      expect(for_bedford.choose_assessment_importer_row_class(assessment_test: 'MCAS Gr 8 Science')).to eq nil
      expect(for_bedford.choose_assessment_importer_row_class(assessment_test: 'MCAS')).to eq nil
      expect(for_bedford.choose_assessment_importer_row_class(assessment_test: 'ACCESS')).to eq nil
    end

    it 'raises for New Bedford' do
      expect { for_new_bedford.choose_assessment_importer_row_class(assessment_test: 'MCAS') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe '#patched_plan_504' do
    it 'works for Somerville when ed plan' do
      student = FactoryBot.build(:student, plan_504: nil)
      student.save!
      EdPlan.create!({
        student_id: student.id,
        sep_status: 1,
        sep_effective_date: Date.parse('2016-09-15'),
        sep_fieldd_006: 'Health disability',
        sep_fieldd_007: 'Rich Districtwide, Laura Principal, Sarah Teacher, Jon Arbuckle (parent)',
        sep_oid: 'test-sep-oid'
      })
      expect(for_somerville.patched_plan_504(student)).to eq '504'
    end

    it 'works for Somerville when no ed plan' do
      student = FactoryBot.build(:student, plan_504: '504')
      student.save!
      expect(for_somerville.patched_plan_504(student)).to eq nil
    end

    it 'works for Bedford' do
      student = FactoryBot.build(:student, plan_504: '504')
      student.save!
      expect(for_bedford.patched_plan_504(student)).to eq '504'
    end

    it 'works for New Bedford' do
      student = FactoryBot.build(:student, plan_504: '504')
      student.save!
      expect(for_new_bedford.patched_plan_504(student)).to eq '504'
    end
  end

  describe '#sports_season_key' do
    it 'works for Somerville' do
      expect(for_somerville.sports_season_key(Time.parse('2017-10-01'))).to eq :fall
      expect(for_somerville.sports_season_key(Time.parse('2017-12-01'))).to eq :winter
      expect(for_somerville.sports_season_key(Time.parse('2018-03-01'))).to eq :winter
      expect(for_somerville.sports_season_key(Time.parse('2018-04-01'))).to eq :spring
      expect(for_somerville.sports_season_key(Time.parse('2018-06-01'))).to eq :spring
      expect(for_somerville.sports_season_key(Time.parse('2018-07-01'))).to eq nil
    end

    it 'returns nil for New Bedford' do
      expect(for_new_bedford.sports_season_key(Time.parse('2017-10-01'))).to eq nil
    end

    it 'returns nil for Bedford' do
      expect(for_bedford.sports_season_key(Time.parse('2017-10-01'))).to eq nil
    end
  end
end
