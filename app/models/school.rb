class School < ApplicationRecord
  extend FriendlyId
  friendly_id :local_id, use: :slugged

  # These are internal to Insights, not from the SIS
  ORDERED_SCHOOL_TYPES = [
    'ECS', # early childhood
    'ES', # elementary
    'ESMS', # elementary and middle
    'MS', # middle
    'HS', # high
    'OTHER' # anything else
  ]

  has_many :students
  has_many :educators
  has_many :homerooms

  validates :local_id, presence: true, uniqueness: true, case_sensitive: false
  validates :name, presence: true, uniqueness: true
  validates :school_type, inclusion: { in: ORDERED_SCHOOL_TYPES }
  validates :slug, presence: true, uniqueness: true, case_sensitive: false

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
end
