require 'rails_helper'

RSpec.describe ImportTask do

  let(:minimum_valid_options) {
    {
      'district' => 'somerville',
    }
  }

  describe '#initialize' do
    context 'with valid options provided' do
      it 'does not raise an error; supplies the correct defaults' do
        expect { ImportTask.new(options: minimum_valid_options) }.not_to raise_error
      end
    end

    context 'with no options provided' do
      it 'does not raise an error; supplies the correct defaults' do
        expect { ImportTask.new(options: {}) }.to raise_error KeyError
      end
    end
  end

end
