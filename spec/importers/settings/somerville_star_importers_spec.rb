require 'rails_helper'

RSpec.describe SomervilleStarImporters do
  let(:options) { { "school" => nil } }
  before { allow(SftpClient).to receive(:for_star) }

  describe '.from_options' do
    it 'returns an array containing one importer' do
      expect(described_class.from_options(options).length).to eq(1)
      expect(described_class.from_options(options).first).to be_an_instance_of(Importer)
    end
  end

end

