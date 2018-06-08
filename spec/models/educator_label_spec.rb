require 'rails_helper'

RSpec.describe EducatorLabel, type: :model do
  let!(:pals) { TestPals.create! }

  it 'validates label_key' do
    expect(EducatorLabel.new(educator: pals.uri, label_key: 'foo').valid?).to eq false
    expect(EducatorLabel.new(educator: pals.uri, label_key: 'shs_experience_team').valid?).to eq true
  end

  it 'validates educator presence' do
    expect(EducatorLabel.new(label_key: 'shs_experience_team').valid?).to eq false
  end
end
