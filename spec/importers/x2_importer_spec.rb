require 'rails_helper'

RSpec.describe do

  describe '#import_from_x2' do
    let!(:x2_importing_class) {
      Class.new do
        include X2Importer
        def export_file_name() 'file.txt' end
        def parse_row(row) row end
      end
    }
    context 'sftp information present' do
      it 'does not raise an error' do
        allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return "sftp-site@site.com"
        allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return "sftp-user"
        allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return "sftp-key"
        allow(Net::SFTP).to receive_messages(start: 'connection established')
        expect { x2_importing_class.new.import_from_x2 }.not_to raise_error
      end
    end
    context 'sftp information missing' do
      it 'raises an error' do
        expect { x2_importing_class.new.import_from_x2 }.to raise_error "SFTP information missing"
      end
    end
  end
  describe '#parse_for_import' do
  end
end
