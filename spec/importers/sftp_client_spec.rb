require 'rails_helper'

RSpec.describe do

  def mock_environment_with_keys
    allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return "sftp-site@site.com"
    allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return "sftp-user"
    allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return "sftp-password"
  end

  def mock_sftp_site
    allow(Net::SFTP).to receive_messages(start: 'connection established')
  end

  describe '#start' do
    context 'sftp client' do
      let(:client) {
        SftpClient.new(
          user: ENV['STAR_SFTP_USER'],
          host: ENV['STAR_SFTP_HOST'],
          password: ENV['STAR_SFTP_PASSWORD']
        )
      }
      context 'with sftp keys' do
        before do
          mock_environment_with_keys
          mock_sftp_site
        end
        it 'establishes a connection' do
          expect(client.start).to eq 'connection established'
        end
      end
      context 'without sftp keys' do
        it 'raises an error' do
          expect { client.start }.to raise_error "SFTP information missing"
        end
      end
    end
  end
end
