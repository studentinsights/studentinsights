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

  # schools
  attr_reader :healey
  attr_reader :shs
  attr_reader :west

  # students
  attr_reader :healey_kindergarten_student
  attr_reader :west_eigth_ryan
  attr_reader :shs_freshman_mari
  attr_reader :shs_freshman_amir

  # educators
  attr_reader :uri
  attr_reader :rich_districtwide
  attr_reader :healey_vivian_teacher
  attr_reader :healey_ell_teacher
  attr_reader :healey_sped_teacher
  attr_reader :healey_laura_principal
  attr_reader :healey_sarah_teacher
  attr_reader :west_marcus_teacher
  attr_reader :shs_jodi
  attr_reader :shs_bill_nye
  attr_reader :shs_ninth_grade_counselor
  attr_reader :shs_hugo_art_teacher
  attr_reader :shs_fatima_science_teacher
  attr_reader :shs_harry_housemaster

  # homerooms
  attr_reader :healey_kindergarten_homeroom
  attr_reader :healey_fifth_homeroom
  attr_reader :west_fifth_homeroom
  attr_reader :shs_jodi_homeroom
  attr_reader :shs_sophomore_homeroom

  # courses
  attr_reader :shs_biology_course
  attr_reader :shs_ceramics_course
  attr_reader :shs_physics_course

  # sections
  attr_reader :shs_tuesday_biology_section
  attr_reader :shs_thursday_biology_section
  attr_reader :shs_second_period_ceramics
  attr_reader :shs_fourth_period_ceramics
  attr_reader :shs_third_period_physics
  attr_reader :shs_fifth_period_physics

  def create!
    School.seed_somerville_schools

    # Uri works in the central office, and is the admin for the
    # project at the district.
    @uri = Educator.create!(
      id: 999999,
      email: 'uri@demo.studentinsights.org',
      full_name: 'Disney, Uri',
      staff_type: 'Administrator',
      can_set_districtwide_access: true,
      districtwide_access: true,
      admin: true,
      schoolwide_access: true,
      restricted_to_sped_students: false,
      restricted_to_english_language_learners: false,
      grade_level_access: [],
      can_view_restricted_notes: true,
      school: School.find_by_local_id('HEA')
    )

    # Rich works in the central office and has districwide access, but
    # not project lead access.
    @rich_districtwide = Educator.create!(
      email: 'rich@demo.studentinsights.org',
      full_name: 'Districtwide, Rich',
      staff_type: 'Administrator',
      can_set_districtwide_access: false,
      districtwide_access: true,
      admin: true,
      schoolwide_access: true,
      restricted_to_sped_students: false,
      restricted_to_english_language_learners: false,
      grade_level_access: [],
      can_view_restricted_notes: true,
      school: nil
    )

    # Healey is a K8 school.
    @healey = School.find_by_local_id!('HEA')
    @healey_kindergarten_homeroom = Homeroom.create!(
      name: 'HEA 003',
      grade: 'KF',
      school: @healey
    )
    @healey_fifth_homeroom = Homeroom.create!(
      name: 'HEA 500',
      grade: '5',
      school: @healey,
    )

    @healey_vivian_teacher = Educator.create!(
      email: 'vivian@demo.studentinsights.org',
      full_name: 'Teacher, Vivian',
      password: 'demo-password',
      staff_type: nil,
      school: @healey,
      homeroom: @healey_kindergarten_homeroom
    )

    @healey_ell_teacher = Educator.create!(
      email: 'alonso@demo.studentinsights.org',
      full_name: 'Teacher, Alonso',
      restricted_to_english_language_learners: true,
      school: @healey
    )
    @healey_sped_teacher = Educator.create!(
      email: 'silva@demo.studentinsights.org',
      full_name: 'Teacher, Silva',
      restricted_to_sped_students: true,
      school: @healey
    )
    @healey_laura_principal = Educator.create!(
      email: 'laura@demo.studentinsights.org',
      full_name: 'Principal, Laura',
      school: @healey,
      staff_type: 'Principal',
      admin: true,
      schoolwide_access: true,
      can_view_restricted_notes: true,
      local_id: '350'
    )
    EducatorLabel.create!(
      educator: @healey_laura_principal,
      label_key: 'class_list_maker_finalizer_principal'
    )
    @healey_sarah_teacher = Educator.create!(
      email: "sarah@demo.studentinsights.org",
      full_name: 'Teacher, Sarah',
      homeroom: @healey_fifth_homeroom,
      school: @healey,
      local_id: '450'
    )
    @healey_kindergarten_student = Student.create!(
      first_name: 'Garfield',
      last_name: 'Skywalker',
      school: @healey,
      homeroom: @healey_kindergarten_homeroom,
      grade: 'KF',
      local_id: '111111111',
      enrollment_status: 'Active'
    )

    # West is a K8 school
    @west = School.find_by_local_id!('WSNS')
    @west_fifth_homeroom = Homeroom.create!(
      name: 'WSNS 501',
      grade: '5',
      school: @west
    )
    @west_marcus_teacher = Educator.create!(
      email: "marcus@demo.studentinsights.org",
      full_name: 'Teacher, Marcus',
      local_id: '550',
      homeroom: @west_fifth_homeroom,
      school: @west
    )
    @west_counselor = Educator.create!(
      email: "les@demo.studentinsights.org",
      full_name: "Counselor, Les",
      local_id: '551',
      school: @west,
      schoolwide_access: true
    )
    EducatorLabel.create!(
      educator: @west_counselor,
      label_key: 'k8_counselor'
    )
    @west_eigth_ryan = Student.create!(
      first_name: 'Ryan',
      last_name: 'Rodriguez',
      school: @west,
      grade: '8',
      local_id: '333333333',
      enrollment_status: 'Active'
    )

    # high school
    @shs = School.find_by_local_id!('SHS')
    @shs_ninth_grade_counselor = Educator.create!(
      email: 'sofia@demo.studentinsights.org',
      full_name: 'Counselor, Sofia',
      school: @shs,
      grade_level_access: ['9']
    )
    EducatorLabel.create!({
      educator: @shs_ninth_grade_counselor,
      label_key: 'use_counselor_based_feed'
    })
    CounselorNameMapping.create!({
      counselor_field_text: 'sofia',
      educator_id: @shs_ninth_grade_counselor.id
    })

    @shs_sophomore_homeroom = Homeroom.create!(name: "SHS ALL", grade: "10", school: @shs)

    # Jodi has a homeroom period at the high school.
    @shs_jodi_homeroom = Homeroom.create!(
      name: 'SHS 942',
      grade: '9',
      school: @shs
    )
    @shs_jodi = Educator.create!(
      email: 'jodi@demo.studentinsights.org',
      full_name: 'Teacher, Jodi',
      school: @shs,
      homeroom: @shs_jodi_homeroom
    )
    EducatorLabel.create!({
      educator: @shs_jodi,
      label_key: 'shs_experience_team'
    })

    @shs_harry_housemaster = Educator.create!(
      email: 'harry@demo.studentinsights.org',
      full_name: 'Housemaster, Harry',
      school: @shs,
      schoolwide_access: true
    )
    EducatorLabel.create!({
      educator: @shs_harry_housemaster,
      label_key: 'high_school_house_master'
    })

    # Bill Nye is a biology teacher at Somerville High School.  He teaches sections
    # on Tuesday and Thursday and has a homeroom period.  And he's on the NGE team.
    @shs_bill_nye_homeroom = Homeroom.create!(
      name: 'SHS 917',
      grade: '9',
      school: @shs
    )
    @shs_bill_nye = Educator.create!(
      email: 'bill@demo.studentinsights.org',
      full_name: 'Teacher, Bill',
      school: @shs,
      homeroom: @shs_bill_nye_homeroom
    )
    @shs_biology_course = Course.create!({
      school: @shs,
      course_number: 'BIO-700',
      course_description: 'BIOLOGY 1 HONORS'
    })
    create_section_assignment(@shs_bill_nye, [
      @shs_tuesday_biology_section = Section.create!(
        course: @shs_biology_course, section_number: 'SHS-BIO-TUES'
      ),
      @shs_thursday_biology_section = Section.create!(
        course: @shs_biology_course, section_number: 'SHS-BIO-THUR'
      )
    ])
    EducatorLabel.create!({
      educator: @shs_bill_nye,
      label_key: 'shs_experience_team'
    })

    # Hugo teachers two sections of ceramics at the high school.
    @shs_hugo_art_teacher = Educator.create!(
      email: "hugo@demo.studentinsights.org",
      full_name: 'Teacher, Hugo',
      local_id: '650',
      school: @shs
    )
    @shs_ceramics_course = Course.create!({
      school: @shs,
      course_number: "ART-302",
      course_description: "ART MAJOR FOUNDATIONS",
    })
    create_section_assignment(@shs_hugo_art_teacher, [
      @shs_second_period_ceramics = Section.create!(
        section_number: "ART-302A",
        term_local_id: "FY",
        schedule: "2(M,R)",
        room_number: "201",
        course: @shs_ceramics_course
      ),
      @shs_fourth_period_ceramics = Section.create!(
        section_number: "ART-302B",
        term_local_id: "FY",
        schedule: "4(M,R)",
        room_number: "234",
        course: @shs_ceramics_course
      )
    ])

    # Fatima teaches two sections of physics at the high school.
    @shs_fatima_science_teacher = Educator.create!(
      email: "fatima@demo.studentinsights.org",
      full_name: 'Teacher, Fatima',
      local_id: '750',
      school: @shs
    )
    @shs_physics_course = Course.create!({
      school: @shs,
      course_number: "SCI-201",
      course_description: "PHYSICS 1"
    })
    create_section_assignment(@shs_fatima_science_teacher, [
      @shs_third_period_physics = Section.create!(
        section_number: "SCI-201A",
        term_local_id: "S1",
        schedule: "3(M,W,F)",
        room_number: "306W",
        course: @shs_physics_course
      ),
      @shs_fifth_period_physics = Section.create!(
        section_number: "SCI-201B",
        term_local_id: "S1",
        schedule: "5(M,W,F)",
        room_number: "306W",
        course: @shs_physics_course
      )
    ])

    # Mari is a freshman at the high school, enrolled in biology and in Jodi's homeroom.
    @shs_freshman_mari = Student.create!(
      first_name: 'Mari',
      last_name: 'Kenobi',
      school: @shs,
      homeroom: @shs_jodi_homeroom,
      house: 'Beacon',
      counselor: 'SOFIA',
      grade: '9',
      date_of_birth: '2004-03-12',
      local_id: '2222222222',
      enrollment_status: 'Active'
    )
    StudentSectionAssignment.create!(
      student: @shs_freshman_mari,
      section: @shs_tuesday_biology_section,
      grade_numeric: 67,
      grade_letter: 'D'
    )
    @shs_freshman_amir = Student.create!(
      first_name: 'Amir',
      last_name: 'Solo',
      school: @shs,
      homeroom: @shs_jodi_homeroom,
      house: 'Elm',
      counselor: 'FISHMAN',
      grade: '9',
      date_of_birth: '2003-02-07',
      local_id: '2222222211',
      enrollment_status: 'Active'
    )
    StudentSectionAssignment.create!(
      student: @shs_freshman_amir,
      section: @shs_third_period_physics,
      grade_numeric: 84,
      grade_letter: 'B'
    )

    reindex!
    self
  end

  def time_now
    Time.zone.local(2018, 3, 13, 11, 03)
  end

  private
  def create_section_assignment(educator, sections)
    sections.each do |section|
      EducatorSectionAssignment.create!(educator: educator, section: section)
    end
  end

  # Normally these records are created in the import process, which
  # computes some indexes after importing.  So we do the same here.
  def reindex!
    Student.update_risk_levels!
    Student.update_recent_student_assessments
  end
end
