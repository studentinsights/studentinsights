RSpec.describe PerDistrict do
  # Preserve global app config
  before { @district_key = ENV['DISTRICT_KEY'] }
  after { ENV['DISTRICT_KEY'] = @district_key }

  def for_somerville
    ENV['DISTRICT_KEY'] = PerDistrict::SOMERVILLE
    PerDistrict.new
  end

  def for_new_bedford
    ENV['DISTRICT_KEY'] = PerDistrict::NEW_BEDFORD
    PerDistrict.new
  end

  describe '#initialize' do
    it 'raises if no district_key' do
      ENV['DISTRICT_KEY'] = ''
      expect { PerDistrict.new }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end

  describe '#from_import_login_name_to_email' do
    it 'works' do
      expect(for_somerville.from_import_login_name_to_email('foo')).to eq('foo@k12.somerville.ma.us')
      expect(for_new_bedford.from_import_login_name_to_email('foo')).to eq('foo@newbedfordschools.org')
      expect { PerDistrict.new(district_key: 'wat').from_import_login_name_to_email('foo') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end
end
