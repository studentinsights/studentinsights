RSpec.describe PerDistrict do
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
      expect(for_new_bedford.from_import_login_name_to_email('foo')).to eq('foo@newbedford.org')
      expect { PerDistrict.new(district_key: 'wat').from_import_login_name_to_email('foo') }.to raise_error Exceptions::DistrictKeyNotHandledError
    end
  end
end
