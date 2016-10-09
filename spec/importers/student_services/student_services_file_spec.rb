require 'rails_helper'

RSpec.describe StudentServicesFile do

  describe '#import' do
    # Read in fixtures
    let(:file_path) { "#{Rails.root}/spec/fixtures/fake_student_services_file.csv" }
    let(:file) { File.new(file_path) }

    # Create student & educator & service_type objects to match the fixtures
    let!(:student_101) { FactoryGirl.create(:student, local_id: '101') }
    let!(:student_102) { FactoryGirl.create(:student, local_id: '102') }
    let!(:administrator) { FactoryGirl.create(:educator) }
    let!(:somer_session) { ServiceType.create({ id: 509, name: 'SomerSession' }) }

    before do
      allow_any_instance_of(
        StudentServicesFile
      ).to receive(:file).and_return(file)

      allow(Educator).to receive(:find_by_id!).and_return administrator
    end

    let(:service_upload) { ServiceUpload.first }
    let(:services_uploaded) { service_upload.services }

    it 'handles a fixture file correctly' do
      described_class.new('SomerSession', nil).import

      expect(ServiceUpload.count).to eq 1
      expect(service_upload.file_name).to eq 'SomerSession'

      expect(services_uploaded.count).to eq 2
      expect(service_upload.services.count).to eq 2

      expect(student_101.services.count).to eq 1
      expect(student_102.services.count).to eq 1
    end

  end

end
