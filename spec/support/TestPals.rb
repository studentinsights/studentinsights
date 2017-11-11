# This class defines a set of users, schools, homerooms and students
# that can be used for testing authorization rules.
#
# These can be re-used for any other test code, but changes here will impact
# many tests, so the intention is that these should not change frequently.
# If new attributes are added to models, update the factories instead.
class TestPals
  def self.create!
    pals = TestPals.new
    pals.create!
    pals
  end

  attr_reader :uri
  attr_reader :healey
  attr_reader :healey_kindergarten_homeroom
  attr_reader :healey_kindergarten_student
  attr_reader :healey_teacher
  attr_reader :healey_ell_teacher
  attr_reader :healey_sped_teacher
  attr_reader :shs
  attr_reader :shs_homeroom
  attr_reader :shs_student
  attr_reader :shs_teacher
  attr_reader :shs_ninth_grade_counselor

  def create!
    School.seed_somerville_schools

    # Uri works in the central office, and is the admin for the entire
    # project at the district.
    @uri = FactoryGirl.create(:educator, {
      email: 'uri@studentinsights.org',
      districtwide_access: true,
      admin: true,
      schoolwide_access: true,
      restricted_to_sped_students: false,
      restricted_to_english_language_learners: false,
      grade_level_access: [],
      can_view_restricted_notes: true,
      school: School.find_by_local_id('HEA')
    })

    # Healey is a K8 school.
    @healey = School.find_by_local_id('HEA')
    @healey_kindergarten_homeroom = FactoryGirl.create(:homeroom, school: healey)
    @healey_kindergarten_student = FactoryGirl.create(:student, {
      school: @healey,
      homeroom: @healey_kindergarten_homeroom,
      grade: 'KF'
    })
    @healey_teacher = FactoryGirl.create(:educator, {
      school: @healey,
      homeroom: @healey_kindergarten_homeroom
    })
    @healey_ell_teacher = FactoryGirl.create(:educator, {
      restricted_to_english_language_learners: true,
      school: @healey
    })
    @healey_sped_teacher = FactoryGirl.create(:educator, {
      restricted_to_sped_students: true,
      school: @healey
    })

    # high school
    @shs = School.find_by_local_id('SHS')
    @shs_homeroom = FactoryGirl.create(:homeroom, school: @shs)
    @shs_student = FactoryGirl.create(:student, {
      school: @shs,
      homeroom: @shs_homeroom,
      grade: '9'
    })
    @shs_teacher = FactoryGirl.create(:educator, {
      school: @shs,
      homeroom: @shs_homeroom
    })
    @shs_ninth_grade_counselor = FactoryGirl.create(:educator, {
      school: @shs,
      grade_level_access: ['9']
    })

    self
  end
end
