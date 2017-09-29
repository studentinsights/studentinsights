require 'rails_helper'

RSpec.describe StudentServicesFile do

  let (:fixture_file_path) { "#{Rails.root}/spec/fixtures/fake_student_services_file.csv" }

  describe '#file' do
    let(:remote_file_name) { 'student_services.csv' }
    let(:sftp_client) { SftpClient.for_x2 }
    let(:fixture_file) { File.new(fixture_file_path) }

    it 'returns file when SftpClient is mocked' do
      allow(sftp_client).to receive(:download_file).with('services_upload/student_services.csv').and_return fixture_file
      student_services_file = StudentServicesFile.new(remote_file_name, sftp_client, STDOUT)
      expect(student_services_file.file).to eq fixture_file
    end
  end

  describe '#import' do
    # Read in fixtures
    let(:file) { File.new(fixture_file_path) }

    # Create student & educator & service_type objects to match the fixtures
    let!(:student_101) { FactoryGirl.create(:student, local_id: '101') }
    let!(:student_102) { FactoryGirl.create(:student, local_id: '102') }
    let!(:administrator) { FactoryGirl.create(:educator) }

    before do
      allow_any_instance_of(
        StudentServicesFile
      ).to receive(:file).and_return(file)

      allow(Educator).to receive(:find_by_id!).and_return administrator
    end

    let(:service_upload) { ServiceUpload.first }
    let(:services_uploaded) { service_upload.services }

    it 'handles a fixture file correctly' do
      described_class.new('SomerSession', nil, double('log', puts: 'ok')).import

      expect(ServiceUpload.count).to eq 1
      expect(service_upload.file_name).to eq 'SomerSession'

      expect(services_uploaded.count).to eq 2
      expect(service_upload.services.count).to eq 2

      expect(student_101.services.count).to eq 1
      expect(student_102.services.count).to eq 1
    end

  end

end
