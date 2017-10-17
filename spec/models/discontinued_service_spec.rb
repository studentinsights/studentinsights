# require 'rails_helper'

# RSpec.describe DiscontinuedService do

#   describe '#must_be_discontinued_after_service_start_date' do
#     let(:educator) { FactoryGirl.create(:educator) }

#     context 'recorded before service start date' do
#       let(:service) { FactoryGirl.create(:service) }
#       let(:discontinued_service) {
#         DiscontinuedService.new(
#           service: service,
#           recorded_by_educator: educator,
#           discontinued_at: service.date_started - 1.day,
#         )
#       }
#       it 'is invalid' do
#         expect(discontinued_service).to be_invalid
#       end
#     end

#     context 'recorded after service start date' do
#       let(:service) { FactoryGirl.create(:service) }
#       let(:discontinued_service) {
#         DiscontinuedService.new(
#           service: service,
#           recorded_by_educator: educator,
#           discontinued_at: service.date_started + 1.day,
#         )
#       }
#       it 'valid' do
#         expect(discontinued_service).to be_valid
#       end
#     end

#   end

# end
