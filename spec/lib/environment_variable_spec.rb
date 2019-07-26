# typed: false
require 'spec_helper'

RSpec.describe EnvironmentVariable do
  describe '#is_true' do
    it 'interprets string values as booleans' do
      ENV['lowercase_false'] = 'false'
      ENV['uppercase_false'] = 'FALSE'
      ENV['lowercase_true'] = 'true'
      ENV['uppercase_true'] = 'TRUE'
      ENV['misspelled_typo_treu'] = 'treu'

      expect(EnvironmentVariable.is_true('nonexistent_key')).to eq false
      expect(EnvironmentVariable.is_true('lowercase_false')).to eq false
      expect(EnvironmentVariable.is_true('uppercase_false')).to eq false
      expect(EnvironmentVariable.is_true('lowercase_true')).to eq true
      expect(EnvironmentVariable.is_true('uppercase_true')).to eq true
      expect(EnvironmentVariable.is_true('misspelled_typo_treu')).to eq false
    end
  end
end
