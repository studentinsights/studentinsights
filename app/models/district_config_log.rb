class DistrictConfigLog < ApplicationRecord
  SFTP_FILENAMES = 'sftp_filenames'

  validates :key, inclusion: { in: [SFTP_FILENAMES] }

  def fetch_latest(key, default = nil)
    where(key: key).order(created_at: :desc).limit(1) || default
  end
end
