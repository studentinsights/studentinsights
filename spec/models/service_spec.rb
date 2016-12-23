require 'rails_helper'

RSpec.describe Service do
  let!(:student) { FactoryGirl.create(:student) }
  let!(:educator) { FactoryGirl.create(:educator) }

  let!(:active_service) { FactoryGirl.create(:service, id: 70001) }
  let!(:another_active_service) { FactoryGirl.create(:service, id: 70002) }

  let!(:discontinued_now) {
    service = FactoryGirl.create(:service, id: 70003)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, recorded_at: Time.now)
    service
  }

  let!(:past_discontinued) {
    service = FactoryGirl.create(:service, id: 70004)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, recorded_at: Time.now - 1.day)
    service
  }

  let!(:future_discontinued) {
    service = FactoryGirl.create(:service, id: 70005)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, recorded_at: Time.now + 1.day)
    service
  }

  let!(:another_future_discontinued) {
    service = FactoryGirl.create(:service, id: 70006)
    DiscontinuedService.create(service: service, recorded_by_educator: educator, recorded_at: Time.now + 2.days)
    service
  }

  let!(:yesterday_service) {
    FactoryGirl.create(:service, date_started: Date.today - 1.day, id: 70007)
  }

  let!(:ten_months_ago_service) {
    FactoryGirl.create(:service, date_started: Date.today - 10.months, id: 70008)
  }

  describe '.active' do
    it 'collects the correct services' do
      active_ids = Service.active.map(&:id).sort
      expect(active_ids).to eq [70001, 70002, 70005, 70006, 70007, 70008]
    end
  end

  describe '.never_discontinued' do
    it 'collects the correct services' do
      never_discontinued_ids = Service.never_discontinued.pluck(:id).sort
      expect(never_discontinued_ids).to eq [70001, 70002, 70007, 70008]
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

  describe '.past_year' do
    it 'collects the correct services' do
      past_year_ids = Service.past_year.pluck(:id).sort
      expect(past_year_ids).to eq [70007, 70008]
    end
  end

end
