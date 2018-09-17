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
end
