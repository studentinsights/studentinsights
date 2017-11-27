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
  attr_reader :healey_kindergarten_student
  attr_reader :healey_teacher
  attr_reader :healey_ell_teacher
  attr_reader :healey_sped_teacher
  attr_reader :healey_kindergarten_homeroom
  attr_reader :shs
  attr_reader :shs_freshman_mari
  attr_reader :shs_jodi
  attr_reader :shs_bill_nye
  attr_reader :shs_ninth_grade_counselor
  attr_reader :shs_jodi_homeroom
  attr_reader :shs_biology_course
  attr_reader :shs_tuesday_biology_section
  attr_reader :shs_thursday_biology_section

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
    @shs_ninth_grade_counselor = FactoryGirl.create(:educator, {
      school: @shs,
      grade_level_access: ['9']
    })

    # Jodi has a homeroom period at the high school.
    @shs_jodi_homeroom = FactoryGirl.create(:homeroom, school: @shs)
    @shs_jodi = FactoryGirl.create(:educator, {
      email: 'jodi@studentinsights.org',
      school: @shs,
      homeroom: @shs_jodi_homeroom
    })

    # Bill Nye is a biology teacher at Somerville High School.  He teaches sections
    # on Tuesday and Thursday and has a homeroom period.
    @shs_bill_nye_homeroom = FactoryGirl.create(:homeroom, school: @shs)
    @shs_bill_nye = FactoryGirl.create(:educator, {
      email: 'billnye@studentinsights.org',
      school: @shs,
      homeroom: @shs_bill_nye_homeroom
    })
    @shs_biology_course = FactoryGirl.create(:course, school: @shs)
    @shs_tuesday_biology_section = FactoryGirl.create(:section, course: @shs_biology_course)
    @shs_thursday_biology_section = FactoryGirl.create(:section, course: @shs_biology_course)
    FactoryGirl.create(:educator_section_assignment, educator: @shs_bill_nye, section: @shs_tuesday_biology_section)
    FactoryGirl.create(:educator_section_assignment, educator: @shs_bill_nye, section: @shs_thursday_biology_section)

    # Mari is a freshman at the high school, enrolled in biology and in Jodi's homeroom.
    @shs_freshman_mari = FactoryGirl.create(:student, {
      school: @shs,
      homeroom: @shs_jodi_homeroom,
      grade: '9'
    })
    FactoryGirl.create(:student_section_assignment, student: @shs_freshman_mari, section: @shs_tuesday_biology_section)

    self
  end
end
