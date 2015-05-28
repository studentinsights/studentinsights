require 'rails_helper'

RSpec.describe do

  let!(:x2_importing_class) {
    Class.new do
      include X2Importer
      def export_file_name() 'file.txt' end
      def import_row(row) row end
    end
  }

  let(:x2_importer) { x2_importing_class.new }

  describe '#connect_to_x2' do
    context 'sftp information present' do
      it 'does not raise an error' do
        allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return "sftp-site@site.com"
        allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return "sftp-user"
        allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return "sftp-key"
        allow(Net::SFTP).to receive_messages(start: 'connection established')
        expect { x2_importer.connect_to_x2 }.not_to raise_error
      end
    end
    context 'sftp information missing' do
      it 'raises an error' do
        expect { x2_importer.connect_to_x2 }.to raise_error "SFTP information missing"
      end
    end
  end
  describe '#import' do
    context 'with good data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_students_export.txt") }
      it 'returns a csv' do
        expect(x2_importer.import(file)).to be_a CSV
      end
      it 'sets the headers correctly' do
        headers = x2_importer.import(file).headers
        expect(headers).to eq [ :state_id, :full_name, :home_language, :grade, :homeroom, :school_local_id ]
      end
    end
  end
end
