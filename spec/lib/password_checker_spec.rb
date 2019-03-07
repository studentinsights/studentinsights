require 'spec_helper'

RSpec.describe PasswordChecker do
  it '#json_stats_encrypted does not raise and encrypts the value' do
    sodium_box = SodiumBox.new(SodiumBox.new_shared_secret64)
    checker = PasswordChecker.new(sodium_box: sodium_box)
    encrypted = checker.json_stats_encrypted('dangerous')
    expect(encrypted).not_to include('dangerous')
  end

  it '#json_stats_encrypted returns different values on subsequent runs' do
    sodium_box = SodiumBox.new(SodiumBox.new_shared_secret64)
    checker = PasswordChecker.new(sodium_box: sodium_box)
    encrypteds = 3.times.map { checker.json_stats_encrypted('dangerous') }
    expect(encrypteds.size).to eq(encrypteds.uniq.size)
  end

  describe 'env variable nil' do
    before do
      @PASSWORD_CHECKER_SECRET64 = ENV['PASSWORD_CHECKER_SECRET64']
      ENV['PASSWORD_CHECKER_SECRET64'] = nil
    end

    after do
      ENV['PASSWORD_CHECKER_SECRET64'] = @PASSWORD_CHECKER_SECRET64
    end

    it 'raises' do
      expect { PasswordChecker.new.json_stats_encrypted('dangerous') }.to raise_error NoMethodError
    end
  end

  describe 'env variable invalid' do
    before do
      @PASSWORD_CHECKER_SECRET64 = ENV['PASSWORD_CHECKER_SECRET64']
      ENV['PASSWORD_CHECKER_SECRET64'] = 'invalid'
    end

    after do
      ENV['PASSWORD_CHECKER_SECRET64'] = @PASSWORD_CHECKER_SECRET64
    end

    it 'raises' do
      expect { PasswordChecker.new.json_stats_encrypted('dangerous') }.to raise_error RbNaCl::LengthError
    end
  end
end
