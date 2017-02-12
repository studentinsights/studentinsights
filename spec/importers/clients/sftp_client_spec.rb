# require 'sftp_client'
require 'rails_helper'

binding.pry
RSpec.describe SftpClient do
  let(:client) { SftpClient.new(*credentials) }

  describe '.for_x2' do
    let(:settings) do
      {
        'SIS_SFTP_HOST' => 'totes valid host',
        'SIS_SFTP_USER' => 'totes valid user',
        'SIS_SFTP_KEY' => 'totes valid key',
      }
    end

    it 'configures the sftp client for X2' do
      expect(SftpClient.for_x2(settings).host).to eq('totes valid host')
      expect(SftpClient.for_x2(settings).user).to eq('totes valid user')
      expect(SftpClient.for_x2(settings).key_data).to eq('totes valid key')
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
      expect(SftpClient.for_star(settings).host).to eq("sftp-site@site.com")
      expect(SftpClient.for_star(settings).user).to eq("sftp-user")
      expect(SftpClient.for_star(settings).password).to eq("sftp-password")
    end
  end

  describe '#sftp_session' do

    context 'using a password' do
      let(:credentials) {
        [
          ENV['STAR_SFTP_USER'],
          ENV['STAR_SFTP_HOST'],
          ENV['STAR_SFTP_PASSWORD'],
          nil
        ]
      }

      context 'with credentials' do
        before do
          allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return "sftp-site@site.com"
          allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return "sftp-user"
          allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return "sftp-password"
          allow(Net::SFTP).to receive_messages(start: 'connection established')
        end

        it 'establishes a connection' do
          expect(client.sftp_session).to eq 'connection established'
        end

        it 'sends the correct data to Net::SFTP' do
          expect(Net::SFTP).to receive(:start).with(
            "sftp-site@site.com", "sftp-user", { :password=>"sftp-password" }
          )

          client.sftp_session
        end
      end

      context 'without credentials' do
        it 'raises an error' do
          expect { client.sftp_session }.to raise_error "SFTP information missing"
        end
      end
    end

    context 'using a key' do
      let(:credentials) {
        [
          ENV['SIS_SFTP_USER'],
          ENV['SIS_SFTP_HOST'],
          nil,
          ENV['SIS_SFTP_KEY']
        ]
      }

      context 'with credentials' do
        before do
          allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return "sftp-site@site.com"
          allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return "sftp-user"
          allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return "sftp-key"
          allow(Net::SFTP).to receive_messages(start: 'connection established')
        end

        it 'establishes a connection' do
          expect(client.sftp_session).to eq 'connection established'
        end

        it 'sends the correct data to Net::SFTP' do
          expect(Net::SFTP).to receive(:start).with(
            "sftp-user", "sftp-site@site.com", { :key_data=>"sftp-key" }
          )

          client.sftp_session
        end
      end
    end
  end
end
