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

  def self.seed_somerville_schools
    config_data = YAML.load(File.open("district-config.yml"))
    schools = config_data.fetch("somerville").fetch("schools")

    School.create!(schools)
  end

  def self.seed_new_bedford_schools
    config_data = YAML.load(File.open("district-config.yml"))
    schools = config_data.fetch("new-bedford").fetch("schools")

    School.create!(schools)
  end

end
