# This class defines a set of users, schools, homerooms and students
# that can be used for testing Bedford-style authorization paths.
class BedfordTestPals
  def self.create!
    pals = BedfordTestPals.new
    pals.create!
    pals
  end

  # educators
  attr_reader :donna

  def create!
    School.seed_bedford_schools

    @donna = Educator.create!(
      id: 999998,
      login_name: 'donna'
      email: 'donna@demo.bedfordps.org',
      full_name: 'Admin, Donna',
      staff_type: 'Administrator',
      can_set_districtwide_access: true,
      districtwide_access: true,
      admin: true,
      schoolwide_access: true,
      restricted_to_sped_students: false,
      restricted_to_english_language_learners: false,
      grade_level_access: [],
      can_view_restricted_notes: true,
    )
  end
end