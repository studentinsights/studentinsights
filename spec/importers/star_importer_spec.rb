require 'rails_helper'

RSpec.describe do

	let(:star_import_class) { Class.new { include StarImporter } }
  let(:star_importer) { star_import_class.new }

  def mock_environment_with_keys
    allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return "sftp-site@site.com"
    allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return "sftp-user"
    allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return "sftp-password"
  end

  def mock_sftp_site
    allow(Net::SFTP).to receive_messages(start: 'connection established')
  end

	describe '#connect_to_star_and_import' do
		context 'with sftp keys' do
			before do
				mock_environment_with_keys
				mock_sftp_site
			end
			it 'establishes a connection' do
        expect(star_importer.connect_to_star_and_import).to eq 'connection established'
			end
		end
		context 'without sftp keys' do
			it 'raises an error' do
				expect { star_importer.connect_to_star_and_import }.to raise_error "SFTP information missing"
			end
		end
	end
end
