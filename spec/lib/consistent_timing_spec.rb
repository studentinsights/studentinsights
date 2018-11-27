RSpec.describe 'ConsistentTiming' do
  describe '#measure_timing_only' do
    it 'enforces timing even when exception raised, and alerts' do
      expect(Rollbar).to receive(:error).with('ConsistentTiming#measure_timing_only caught an error', err: Exceptions::InvalidConfiguration)
      start_clock = Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
      expect(ConsistentTiming.new.enforce_timing(500) { raise Exceptions::InvalidConfiguration }).to eq nil
      end_clock = Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
      expect(end_clock - start_clock).to be_within(100).of(500)
    end
  end
end
