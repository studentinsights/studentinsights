class School < ActiveRecord::Base
  extend FriendlyId
  friendly_id :local_id, use: :slugged
  validates :local_id, presence: true, uniqueness: true
  validate :validate_school_type
  has_many :students
  has_many :educators
  has_many :homerooms

  # These are internal to Insights, not from the SIS
  SCHOOL_TYPES = [
    'ECS', # early childhood
    'ES', # elementary
    'ESMS', # elementary and middle
    'MS', # middle
    'HS', # high
    'OTHER' # anything else
  ]

  def is_high_school?
    school_type == 'HS'
  end

  # deprecated
  def educators_without_test_account
    educators.where.not(local_id: 'LDAP')
  end

  # deprecated
  def educator_names_for_services
    educators_without_test_account.pluck(:full_name)
  end

  private
  def validate_school_type
    if !SCHOOL_TYPES.include?(school_type)
      errors.add(:school_type, 'invalid school_type; use nil for unknown values or add to validation whitelist')
    end
  end
end
