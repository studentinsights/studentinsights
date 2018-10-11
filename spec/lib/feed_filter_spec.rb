require 'spec_helper'

RSpec.describe FeedFilter do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe 'housemaster-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
    end

    it 'does not filter for anyone when disabled globally' do
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return(nil)
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does not filter without mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return('true')
      (Educator.all - [pals.shs_harry_housemaster]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does filter when enabled globally and there is a mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return('true')
      unfiltered_students = Authorizer.new(pals.shs_harry_housemaster).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      )
      expect(FeedFilter.new(pals.shs_harry_housemaster).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      ])
    end
  end

  describe 'counselor-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
    end

    it 'does not filter for anyone when disabled globally' do
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does not filter without mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return('true')
      (Educator.all - [pals.shs_sofia_counselor]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does filter when enabled globally and there is a mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return('true')
      unfiltered_students = Authorizer.new(pals.shs_sofia_counselor).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      )
      expect(FeedFilter.new(pals.shs_sofia_counselor).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        pals.shs_freshman_mari
      ])
    end
  end

  describe 'section-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return(nil)
    end

    it 'when disabled globally, does not filter for anyone' do
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does not filter without mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return('true')
      (Educator.all - [pals.shs_fatima_science_teacher]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'filters to only students in sections when enabled globally' do
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return('true')
      unfiltered_students = Authorizer.new(pals.shs_fatima_science_teacher).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      )
      expect(FeedFilter.new(pals.shs_fatima_science_teacher).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        pals.shs_freshman_amir
      ])
    end
  end
end
