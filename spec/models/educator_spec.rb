require 'rails_helper'

RSpec.describe Educator do
  describe '#create' do
    let(:attributes) { FactoryGirl.attributes_for(:educator) }

    it 'makes a new educator in the database' do
      expect {
        Educator.create!(attributes)
      }.to change(Educator, :count).by(1)
    end
  end
end
