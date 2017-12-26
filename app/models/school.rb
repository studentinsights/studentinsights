class School < ActiveRecord::Base
  extend FriendlyId
  friendly_id :local_id, use: :slugged
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

  def self.fetch_school_data_for_district(district_key)
    YAML.load(File.open("config/district_#{district_key}.yml")).fetch("schools")
  end

  def self.seed_somerville_schools
    district_key = ENV.fetch('DISTRICT_KEY')

    schools = School.fetch_school_data_for_district(district_key)

    School.create!(schools)
  end

end
