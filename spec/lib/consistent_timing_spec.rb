# typed: false
RSpec.describe 'ConsistentTiming' do
  def read_clock
    Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
  end

  describe '#enforce_timing' do
    it 'is accurate within bounds' do
      start_clock = read_clock()
      ConsistentTiming.new.enforce_timing(200) { 3 + 6 }
      end_clock = read_clock()
      expect(end_clock - start_clock).to be_within(20).of(200)
    end

    it 'alerts when it cannot enforce timing' do
      expect(Rollbar).to receive(:warn).once.with('ConsistentTiming#wait_for_milliseconds_or_alert was negative', {
        milliseconds_to_wait: anything
      })

      start_clock = read_clock()
      ConsistentTiming.new.enforce_timing(100) { sleep(0.5) }
      end_clock = read_clock()
      expect(end_clock - start_clock).to be > 100
      expect(end_clock - start_clock).to be_within(20).of(500)
    end
  end

  describe '#measure_timing_only' do
    it 'enforces timing even when exception raised, and alerts' do
      expect(Rollbar).to receive(:error).with('ConsistentTiming#measure_timing_only caught an error', err: Exceptions::InvalidConfiguration)
      expect(Rollbar).to receive(:error).with(Exceptions::InvalidConfiguration)
      start_clock = read_clock()
      expect(ConsistentTiming.new.enforce_timing(500) { raise Exceptions::InvalidConfiguration }).to eq nil
      end_clock = read_clock()
      expect(end_clock - start_clock).to be_within(100).of(500)
    end
  end
end
