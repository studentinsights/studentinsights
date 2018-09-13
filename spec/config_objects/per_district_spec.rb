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

  def for_bedford
    ENV['DISTRICT_KEY'] = PerDistrict::BEDFORD
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

  describe '#find_educator_from_login_text' do
    context 'somerville' do
      let!(:educator) { FactoryBot.create(:educator, email: 'baz@k12.somerville.ma.us') }

      it 'returns educator when login text matches' do
        found_educator = for_somerville.find_educator_from_login_text('baz@k12.somerville.ma.us')

        expect(found_educator).to eq(educator)
      end
      it 'returns nil when login text does not math' do
        found_educator = for_somerville.find_educator_from_login_text('fee@k12.somerville.ma.us')

        expect(found_educator).to eq(nil)
      end
    end

    context 'bedford' do
      let!(:educator) { FactoryBot.create(:educator, login_name: 'bar') }

      it 'returns educator when login text matches' do
        found_educator = for_bedford.find_educator_from_login_text('bar')

        expect(found_educator).to eq(educator)
      end
      it 'returns nil when login text does not math' do
        found_educator = for_bedford.find_educator_from_login_text('bat')

        expect(found_educator).to eq(nil)
      end
    end
  end

  describe '#from_educator_row_to_email' do
    it 'works' do
      expect(for_somerville.from_educator_row_to_email(
        login_name: 'foo'
      )).to eq('foo@k12.somerville.ma.us')
      expect(for_new_bedford.from_educator_row_to_email(
        login_name: 'foo'
      )).to eq('foo@newbedfordschools.org')
      expect(for_bedford.from_educator_row_to_email(
        email: 'foo@bedfordps.org'
      )).to eq('foo@bedfordps.org')

      expect {
        PerDistrict.new(district_key: 'wat').from_educator_row_to_email('foo')
      }.to raise_error(
        Exceptions::DistrictKeyNotHandledError
      )
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
