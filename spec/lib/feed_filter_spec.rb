require 'spec_helper'

RSpec.describe FeedFilter do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  context 'when disabled globally' do
    before { @enabled_counselor_based_feed = ENV['ENABLE_COUNSELOR_BASED_FEED'] }
    before { ENV['ENABLE_COUNSELOR_BASED_FEED'] = nil }
    after { ENV['ENABLE_COUNSELOR_BASED_FEED'] = @enabled_counselor_based_feed }

    it 'does not filter for anyone' do
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active }
        puts educator.login_name
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end
  end

  context 'without mapping for educator' do
    it 'does not filter' do
      (Educator.all - [pals.shs_sofia_counselor]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end
  end

  context 'when enabled globally and there is a mapping for educator' do
    it 'does filter' do
      unfiltered_students = Authorizer.new(pals.shs_sofia_counselor).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir
      )
      expect(FeedFilter.new(pals.shs_sofia_counselor).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        pals.shs_freshman_mari
      ])
    end
  end
end
