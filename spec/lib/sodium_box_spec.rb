require 'spec_helper'

# These are just smoke tests
RSpec.describe SodiumBox do
  TEST_ITERATIONS = 1000

  it '.new_shared_secret64 generates unique values' do
    secrets = TEST_ITERATIONS.times.map { SodiumBox.new_shared_secret64 }
    expect(secrets.size).to eq(secrets.uniq.size)
  end

  it 'works round-trip' do
    box = SodiumBox.new(SodiumBox.new_shared_secret64)
    expect(box.decrypt64(box.encrypt64('foo'))).to eq 'foo'
    TEST_ITERATIONS.times do
      test_string = SecureRandom.hex
      expect(box.decrypt64(box.encrypt64(test_string))).to eq test_string
    end
  end

  it 'generates different values for each encryption' do
    box = SodiumBox.new(SodiumBox.new_shared_secret64)
    payloads = TEST_ITERATIONS.times.map { box.encrypt64('foo') }
    expect(payloads.size).to eq(payloads.uniq.size)
  end

  it 'cannot decrypt with wrong secret' do
    box1 = SodiumBox.new(SodiumBox.new_shared_secret64)
    box2 = SodiumBox.new(SodiumBox.new_shared_secret64)
    TEST_ITERATIONS.times do
      expect { box2.decrypt64(box1.encrypt64(SecureRandom.hex)) }.to raise_error RbNaCl::CryptoError
      expect { box1.decrypt64(box2.encrypt64(SecureRandom.hex)) }.to raise_error RbNaCl::CryptoError
    end
  end
end
