require 'rails_helper'
require 'capybara/rspec'

describe 'Multifactor', type: :feature do
  let!(:pals) { TestPals.create! }

  def before_set_timing!(milliseconds)
    @store_CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS = ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS']
    ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS'] = milliseconds.to_s
  end

  def after_reset_timing!
    ENV['CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS'] = @store_CONSISTENT_TIMING_FOR_MULTIFACTOR_CODE_IN_MILLISECONDS
  end

  def create_multifactor_attempts_across_educators(options = {})
    seed = options.fetch(:seed, RSpec.configuration.seed)
    login_texts = ['invalid_login_text', '', nil] + Educator.all.map do |educator|
      "#{educator.login_name}@demo.studentinsights.org"
    end
    login_texts.shuffle(random: Random.new(seed))
  end

  describe 'across all execution paths' do
    let!(:expected_timing_in_milliseconds) { 400 } # for faster tests
    before(:each) { LoginTests.reset_rack_attack! }
    before(:each) { before_set_timing!(expected_timing_in_milliseconds) }
    after(:each) { after_reset_timing! }

    it 'has consistent timing within range (after warm-up)' do
      feature_timing_warm_up!(pals.uri)

      # Test many attempts across all educators in random order; none should leak what's
      # happening on the server-side through response timing.
      login_text_attempts = create_multifactor_attempts_across_educators(seed: RSpec.configuration.seed)
      login_text_attempts.each do |login_text|
        _, elapsed_milliseconds = ConsistentTiming.new.measure_timing_only do
          feature_request_multifactor(login_text)
        end
        expect(page.html).to eq ''
        feature_reset_login_attempt!

        tolerance_ms = 100
        failure_message = "unexpected timing for login_text='#{login_text}'  timing: #{elapsed_milliseconds}"
        expect(elapsed_milliseconds).to be_within(tolerance_ms).of(expected_timing_in_milliseconds), failure_message
        print('✓') # a nice progress indicator since these are slower tests
      end
      expect(login_text_attempts.size).to eq(Educator.all.size + 3)
    end
  end
end
