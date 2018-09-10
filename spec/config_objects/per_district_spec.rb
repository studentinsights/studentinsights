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

  def for_demo
    ENV['DISTRICT_KEY'] = PerDistrict::DEMO
    PerDistrict.new
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

  describe '#from_import_row_to_email' do
    it 'works' do
      expect(for_somerville.from_import_row_to_email('foo')).to eq('foo@k12.somerville.ma.us')
      expect(for_new_bedford.from_import_row_to_email('foo')).to eq('foo@newbedfordschools.org')

      # TODO: Bedford.
      expect { PerDistrict.new(district_key: 'wat').from_import_row_to_email('foo') }.to raise_error Exceptions::DistrictKeyNotHandledError
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
