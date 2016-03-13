require 'rails_helper'

RSpec.describe SftpClient do
  let(:client) { SftpClient.new(credentials: credentials) }

  describe '.for_x2' do
    let(:settings) do
      {
        'SIS_SFTP_HOST' => 'totes valid host',
        'SIS_SFTP_USER' => 'totes valid user',
        'SIS_SFTP_KEY' => 'totes valid key',
      }
    end

    it 'configures the sftp client for X2' do
      expect(SftpClient.for_x2(settings).credentials[:host]).to eq('totes valid host')
      expect(SftpClient.for_x2(settings).credentials[:user]).to eq('totes valid user')
      expect(SftpClient.for_x2(settings).credentials[:key_data]).to eq('totes valid key')
    end
  end

  describe '.for_star' do
    let(:settings) do
      {
        'STAR_SFTP_HOST' => "sftp-site@site.com",
        'STAR_SFTP_USER' => "sftp-user",
        'STAR_SFTP_PASSWORD' => "sftp-password",
      }
    end

    it 'configures the sftp client for star' do
      expect(SftpClient.for_star(settings).credentials[:host]).to eq("sftp-site@site.com")
      expect(SftpClient.for_star(settings).credentials[:user]).to eq("sftp-user")
      expect(SftpClient.for_star(settings).credentials[:password]).to eq("sftp-password")
    end
  end

  describe '#sftp_session' do
    context 'sftp client' do
      let(:credentials) {
        {
          user: ENV['STAR_SFTP_USER'],
          host: ENV['STAR_SFTP_HOST'],
          password: ENV['STAR_SFTP_PASSWORD']
        }
      }
      context 'with sftp keys' do
        before do
          allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return "sftp-site@site.com"
          allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return "sftp-user"
          allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return "sftp-password"
          allow(Net::SFTP).to receive_messages(start: 'connection established')
        end
        it 'establishes a connection' do
          expect(client.sftp_session).to eq 'connection established'
        end
      end
      context 'without sftp keys' do
        it 'raises an error' do
          expect { client.sftp_session }.to raise_error "SFTP information missing"
        end
      end
    end
  end
end
