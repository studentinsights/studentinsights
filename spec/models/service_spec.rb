require 'rails_helper'

RSpec.describe Service do
  let!(:student) { FactoryGirl.create(:student) }
  let!(:educator) { FactoryGirl.create(:educator) }

  let!(:active_service) { FactoryGirl.create(:service, id: 70001) }
  let!(:another_active_service) { FactoryGirl.create(:service, id: 70002) }

  let!(:discontinued_now) {
    service = FactoryGirl.create(:service, id: 70003)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, discontinued_at: Time.now)
    service
  }

  let!(:past_discontinued) {
    service = FactoryGirl.create(:service, id: 70004)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, discontinued_at: Time.now - 1.day)
    service
  }

  let!(:future_discontinued) {
    service = FactoryGirl.create(:service, id: 70005)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, discontinued_at: Time.now + 1.day)
    service
  }

  let!(:another_future_discontinued) {
    service = FactoryGirl.create(:service, id: 70006)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, discontinued_at: Time.now + 2.days)
    service
  }

  describe '.active' do
    it 'collects the correct services' do
      active_ids = Service.active.map(&:id).sort
      expect(active_ids).to eq [70001, 70002, 70005, 70006]
    end
  end

  describe '.never_discontinued' do
    it 'collects the correct services' do
      never_discontinued_ids = Service.never_discontinued.pluck(:id).sort
      expect(never_discontinued_ids).to eq [70001, 70002]
    end
  end

  describe '.future_discontinue' do
    it 'collects the correct services' do
      future_discontinued_ids = Service.future_discontinue.pluck(:id).sort
      expect(future_discontinued_ids).to eq [70005, 70006]
    end
  end

  describe '.discontinued' do
    it 'collects the correct services' do
      discontinued_ids = Service.discontinued.pluck(:id).sort
      expect(discontinued_ids).to eq [70003, 70004]
    end
  end

end
