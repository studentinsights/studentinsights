require 'spec_helper'

RSpec.describe FeedFilter do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe 'housemaster-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return(nil)
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
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return(nil)
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
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return(nil)
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

  describe 'English language learner-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return(nil)

      # for this test case, make Kylo ELL and set the flag for Fatima
      pals.shs_senior_kylo.update!(limited_english_proficiency: 'Limited') # per district, Somerville
      EducatorLabel.create!(
        educator: pals.shs_fatima_science_teacher,
        label_key: 'use_ell_based_feed'
      )
    end

    it 'when disabled globally, does not filter for anyone' do
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return(nil)
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does not filter without mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return('true')
      (Educator.all - [pals.shs_fatima_science_teacher]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'filters to only ELL students when enabled globally' do
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return('true')
      unfiltered_students = Authorizer.new(pals.shs_fatima_science_teacher).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.shs_freshman_mari,
        pals.shs_freshman_amir,
        pals.shs_senior_kylo
      )
      expect(FeedFilter.new(pals.shs_fatima_science_teacher).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        pals.shs_senior_kylo
      ])
    end
  end

  describe 'Community School-based feed only' do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ENABLE_COUNSELOR_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_HOUSEMASTER_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_SECTION_BASED_FEED').and_return(nil)
      allow(ENV).to receive(:[]).with('ENABLE_ELL_BASED_FEED').and_return(nil)
    end

    # for this test case, make a new student who's active in Community Schools
    # and make sure they're the only one
    let!(:afterschool_student) do
      Service.where(service_type_id: ServiceType::COMMUNITY_SCHOOLS).each {|service| service.destroy! }
      afterschool_student = FactoryBot.create(:student, {
        school_id: pals.west.id
      })
      FactoryBot.create(:service, {
        student_id: afterschool_student.id,
        date_started: Time.now - 20.days,
        discontinued_at: nil,
        service_type_id: ServiceType::COMMUNITY_SCHOOLS
      })
      afterschool_student
    end

    # and make a new educator
    let!(:afterschool_coordinator) do
      afterschool_coordinator = FactoryBot.create(:educator, {
        school_id: afterschool_student.school_id,
        schoolwide_access: true
      })
      EducatorLabel.create!(
        educator: afterschool_coordinator,
        label_key: 'use_community_school_based_feed'
      )
      afterschool_coordinator
    end

    it 'when disabled globally, does not filter for anyone' do
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return(nil)
      Educator.all.each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'does not filter without mapping for educator' do
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return('true')
      (Educator.all - [afterschool_coordinator]).each do |educator|
        unfiltered_students = Authorizer.new(educator).authorized { Student.active.to_a }
        expect(FeedFilter.new(educator).filter_for_educator(unfiltered_students)).to contain_exactly(*unfiltered_students)
      end
    end

    it 'filters to only Community Schools students when enabled globally' do
      allow(ENV).to receive(:[]).with('ENABLE_COMMUNITY_SCHOOL_BASED_FEED').and_return('true')
      unfiltered_students = Authorizer.new(afterschool_coordinator).authorized { Student.active.to_a }
      expect(unfiltered_students).to contain_exactly(
        pals.west_eighth_ryan,
        afterschool_student
      )
      expect(FeedFilter.new(afterschool_coordinator).filter_for_educator(unfiltered_students)).to contain_exactly(*[
        afterschool_student
      ])
    end
  end
end
