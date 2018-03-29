RSpec.describe SftpClient do
  def mock_env_for_x2
    allow(ENV).to receive(:[]).with('SIS_SFTP_HOST').and_return "sis.x2.com"
    allow(ENV).to receive(:[]).with('SIS_SFTP_USER').and_return "sis-user"
    allow(ENV).to receive(:[]).with('SIS_SFTP_KEY').and_return "sis-key"
  end

  def mock_env_for_star
    allow(ENV).to receive(:[]).with('STAR_SFTP_HOST').and_return "ftp.star.com"
    allow(ENV).to receive(:[]).with('STAR_SFTP_USER').and_return "sftp-user"
    allow(ENV).to receive(:[]).with('STAR_SFTP_PASSWORD').and_return "sftp-password"
  end

  describe '.for_x2' do
    before { mock_env_for_x2 }
    it 'configures the sftp client for X2' do
      sftp_client = SftpClient.for_x2
      expect(sftp_client.send(:host)).to eq('sis.x2.com')
      expect(sftp_client.send(:user)).to eq('sis-user')
      expect(sftp_client.send(:key_data)).to eq('sis-key')
    end
  end

  describe '.for_star' do
    before { mock_env_for_star }
    it 'configures the sftp client for STAR' do
      sftp_client = SftpClient.for_star
      expect(sftp_client.send(:host)).to eq('ftp.star.com')
      expect(sftp_client.send(:user)).to eq('sftp-user')
      expect(sftp_client.send(:password)).to eq('sftp-password')
    end
  end

  describe '#sftp_session' do
    context 'when using a password for STAR' do
      before do
        mock_env_for_star
        allow(Net::SFTP).to receive_messages(start: 'sftp_client')
      end

      it 'sends the correct data to Net::SFTP' do
        expect(Net::SFTP).to receive(:start).with(
          "ftp.star.com", "sftp-user", { :password=>"sftp-password" }
        )
        expect(SftpClient.for_star.send(:sftp_session)).to eq 'sftp_client'
      end
    end

    context 'when using a key for X2' do
      before do
        mock_env_for_x2
        allow(Net::SFTP).to receive_messages(start: 'sftp_client')
      end

      it 'sends the correct data to Net::SFTP' do
        expect(Net::SFTP).to receive(:start).with(
          "sis.x2.com", "sis-user", { :key_data=>"sis-key" }
        )
        expect(SftpClient.for_x2.send(:sftp_session)).to eq 'sftp_client'
      end
    end

    context 'when called twice' do
      before do
        mock_env_for_star
        allow(Net::SFTP).to receive_messages(start: 'sftp_client')
      end

      it 're-uses the Net::SFTP connection' do
        client = SftpClient.for_star
        expect(Net::SFTP).to receive(:start).with(
          "ftp.star.com", "sftp-user", { :password=>"sftp-password" }
        ).once
        client.send(:sftp_session)
        client.send(:sftp_session)
      end
    end

  end
end
