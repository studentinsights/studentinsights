# Stores configuration that folks in the district ideally would manage on their
# own.  In other words, this shouldn't be config that handles internals about
# how Student Insights is different across districts, but "district maintenance"
# that district IT and district project leads could manage.
class DistrictConfigLog < ApplicationRecord
  SFTP_FILENAMES = 'sftp_filenames'

  validates :key, inclusion: { in: [SFTP_FILENAMES] }

  def latest(key)
    where(key: key).order(created_at: :desc).limit(1)
  end
end
