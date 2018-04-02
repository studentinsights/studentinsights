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

  describe '#in_shs_experience_team?' do
    it 'includes bill from TestPals' do
      expect(for_somerville.in_shs_experience_team?(pals.shs_bill_nye)).to eq true
    end

    it 'works with minimal test case' do
      educator = FactoryGirl.create!(:educator)
      EducatorLabel.create!({
        educator: educator,
        label_key: 'shs_experience_team'
      })
      expect(for_somerville.in_shs_experience_team?(pals.educator)).to eq true
    end

    it 'ignores other labels' do
      educator = FactoryGirl.create!(:educator)
      EducatorLabel.create!({
        educator: educator,
        label_key: 'foo_experience_team_wrong_label'
      })
      expect(for_somerville.in_shs_experience_team?(pals.educator)).to eq false
    end

    it 'never works for New Bedford' do
      expect(for_new_bedford.in_shs_experience_team?(pals.shs_bill_nye)).to eq false
    end
  end
end
