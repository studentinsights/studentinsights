# Stores configuration that folks in the district ideally would manage on their
# own.  In other words, this shouldn't be config that handles internals about
# how Student Insights is different across districts, but "district maintenance"
# that district IT and district project leads could manage.
class DistrictConfigLog < ApplicationRecord
  SFTP_FILENAMES = 'sftp_filenames'

  validates :key, inclusion: { in: [SFTP_FILENAMES] }

  def self.latest_json(key, fallback = nil)
    where(key: key).order(created_at: :desc).limit(1).try(:first).try(:json) || fallback
  end

  # These aren't entirely static, but this seeds with
  # values that are useful for dev and test.
  def self.seed_for_development_and_test!
    is_allowed = (
      Rails.env.development? ||
      Rails.env.test? ||
      EnvironmentVariable.is_true('ALLOW_DISTRICT_CONFIG_LOG_SEED')
    )
    raise 'only for dev/test!' unless is_allowed

    DistrictConfigLog.create!({
      key: DistrictConfigLog::SFTP_FILENAMES,
      json: JSON.parse(IO.read('config/sftp_filenames_development_fixture.json'))
    })
  end
end
