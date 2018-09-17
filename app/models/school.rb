class School < ActiveRecord::Base
  extend FriendlyId
  friendly_id :local_id, use: :slugged
  validates :local_id, presence: true, uniqueness: true
  validate :validate_school_type
  has_many :students
  has_many :educators
  has_many :homerooms

  def self.with_students
    School.all.select { |s| s.students.count > 0 }
  end

  def educators_without_test_account
    educators.where.not(local_id: 'LDAP')
  end

  def educator_names_for_services
    educators_without_test_account.pluck(:full_name)
  end

  def is_high_school?
    school_type == 'HS'
  end

  private
  def validate_school_type
    whitelist = ['ES', 'MS', 'ESMS', 'HS', nil]
    if !whitelist.include?(school_type)
      errors.add(:school_type, 'invalid school_type; use nil for unknown values or add to validation whitelist')
    end
  end
end
