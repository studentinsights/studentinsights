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
        expect(FeedFilter.new(educator).by_counselor_caseload(unfiltered_students)).to contain_exactly(*unfiltered_students)
        expect(FeedFilter.new(educator).use_counselor_based_feed?).to eq false
      end
    end
  end

  context 'without mapping for educator' do
    it 'does not filter' do
      (Educator.all - [pals.shs_ninth_grade_counselor]).each do |educator|
        expect(FeedFilter.new(educator).use_counselor_based_feed?).to eq false
      end
    end
  end

  context 'when enabled globally and there is a mapping for educator' do
    it 'returns true for #use_counselor_based_feed?' do
      expect(FeedFilter.new(pals.shs_ninth_grade_counselor).use_counselor_based_feed?).to eq true
    end

    it 'filters with by_counselor_caseload' do
      unfiltered_students = Authorizer.new(pals.shs_ninth_grade_counselor).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir
      )
      expect(FeedFilter.new(pals.shs_ninth_grade_counselor).by_counselor_caseload(unfiltered_students)).to contain_exactly(*[
        pals.shs_freshman_mari
      ])
    end
  end
end
