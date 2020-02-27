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

  def mock_download_file_and_lstat!(remote_filename_path, contents, lstat_mtime)
    Tempfile.new('mock_remote_file').tap do |mock_remote_file|
      mock_remote_file.write contents
      mock_remote_file.close

      mock_sftp_session = instance_double(Net::SFTP::Session)
      expect(mock_sftp_session).to receive(:download!) do |remote_file_name, local_path|
        IO.write(local_path, IO.read(mock_remote_file))
      end
      expect(mock_sftp_session).to receive(:lstat).with(remote_filename_path) do |&block|
        block.call(MockLstatResponse.new(attrs: MockLstatAttrs.new(lstat_mtime)))
      end

      expect(Net::SFTP).to receive(:start) do |&block|
        block.call(mock_sftp_session)
      end

      yield
    end
  end

  class MockLstatResponse < Struct.new :data
  end
  class MockLstatAttrs < Struct.new :mtime
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

  describe '#download_file' do
    let!(:time_now) { TestPals.new.time_now }
    it 'works on happy path' do
      expect(Rollbar).not_to receive(:error)
      remote_filename_path = '/remote/foo/bar/assessment.csv'
      contents = "name,pitch_name,rating\npedro,change up,awesome"
      mock_download_file_and_lstat!(remote_filename_path, contents, time_now - 2.hours) do
        mock_env_for_x2()
        client = SftpClient.for_x2(time_now: time_now)
        file = client.download_file(remote_filename_path)
        expect(IO.read(file)).to eq(contents)
      end
    end

    it 'safely handles remote_file_path' do
      remote_filename_path = '/remote/foo/bar/../../assessment.csv'
      contents = "name,pitch_name,rating\npedro,change up,awesome"
      mock_download_file_and_lstat!(remote_filename_path, contents, time_now - 2.hours) do
        mock_env_for_x2()
        client = SftpClient.for_x2(time_now: time_now)
        file = client.download_file(remote_filename_path)
        expect(File.basename(file)).to eq 'assessment.csv'
        expect(file.path.ends_with?('tmp/data_download/assessment.csv')).to eq true
        expect(IO.read(file)).to eq(contents)
      end
    end

    it 'check_freshness alerts if file is stale' do
      mtime = time_now - 4.days
      expect(Rollbar).to receive(:error).once.with("SftpClient#check_freshness! failed for remote file, basename: assessment.csv, last modified: 1520593380")

      remote_filename_path = '/remote/foo/bar/assessment.csv'
      contents = "name,pitch_name,rating\npedro,change up,awesome"
      mock_download_file_and_lstat!(remote_filename_path, contents, mtime) do
        mock_env_for_x2()
        client = SftpClient.for_x2(time_now: time_now)
        file = client.download_file(remote_filename_path)
        expect(IO.read(file)).to eq(contents)
      end
    end

    it 'responds to options about disabling check_freshness' do
      mtime = time_now - 4.days
      expect(Rollbar).not_to receive(:error)

      remote_filename_path = '/remote/foo/bar/assessment.csv'
      contents = "name,pitch_name,rating\npedro,change up,awesome"
      mock_download_file_and_lstat!(remote_filename_path, contents, mtime) do
        mock_env_for_x2()
        client = SftpClient.for_x2({
          time_now: time_now,
          modified_within_n_days: 7
        })
        file = client.download_file(remote_filename_path)
        expect(IO.read(file)).to eq(contents)
      end
    end
  end

  describe '#with_sftp_session' do
    context 'when using a password for STAR' do
      before { mock_env_for_star }
      it 'sends the correct data to Net::SFTP' do
        expect(Net::SFTP).to receive(:start).with("ftp.star.com", "sftp-user", { :password=>"sftp-password" }) do |&block|
          block.call(instance_double(Net::SFTP::Session))
        end
        SftpClient.for_star.send(:with_sftp_session) do |sftp_session|
          # noop, just asserting that Net::SFTP received what we expect
        end
      end
    end

    context 'when using a key for X2' do
      before { mock_env_for_x2 }
      it 'sends the correct data to Net::SFTP' do
        expect(Net::SFTP).to receive(:start).with("sis.x2.com", "sis-user", { :key_data=>"sis-key" }) do |&block|
          block.call(instance_double(Net::SFTP::Session))
        end
        SftpClient.for_x2.send(:with_sftp_session) do |sftp_session|
          # noop, just asserting that Net::SFTP received what we expect
        end
      end
    end

    context 'when called twice' do
      before { mock_env_for_x2 }
      it 'makes two separate Net::SFTP connections, using v2 asan example' do
        expect(Net::SFTP).to receive(:start).twice.with("sis.x2.com", "sis-user", { :key_data=>"sis-key" }) do |&block|
          block.call(instance_double(Net::SFTP::Session))
        end

        first_session = nil
        SftpClient.for_x2.send(:with_sftp_session) do |sftp_session|
          first_session = sftp_session
        end
        second_session = nil
        SftpClient.for_x2.send(:with_sftp_session) do |sftp_session|
          second_session = sftp_session
        end
        expect(first_session == second_session).to eq(false)
      end
    end

  end
end
