class ServiceType < ApplicationRecord
  has_many :services
  validates :name, presence: true, uniqueness: true

  COMMUNITY_SCHOOLS = 513

  def self.seed_for_all_districts
    ServiceType.destroy_all
    ServiceType.create([
      { id: 502, name: 'Attendance Officer'},
      { id: 503, name: 'Attendance Contract'},
      { id: 504, name: 'Behavior Contract'},
      { id: 505, name: 'Counseling, in-house'},
      { id: 506, name: 'Counseling, outside'},
      { id: 507, name: 'Reading intervention'},
      { id: 508, name: 'Math intervention'},
      { id: 509, name: 'SomerSession' },
      { id: 510, name: 'Summer Program for English Language Learners' },
      { id: 511, name: 'Afterschool Tutoring' },
      { id: 512, name: 'Freedom School' },
      { id: 513, name: 'Community Schools' },
      { id: 514, name: 'X-Block' }
    ])
  end

  # This is a separate method because of migrations
  def self.add_summer_program_status_to_service_types
    [509, 510, 512].each do |id|
      ServiceType.find(id).update!({ summer_program: true })
    end
  end

  # This is a separate method because of migrations
  def self.add_somerville_summer_2018_service_types
    ServiceType.create!([
      { id: 515, name: 'Calculus Project' },
      { id: 516, name: 'Boston Breakthrough' },
      { id: 517, name: 'Summer Explore' },
      { id: 518, name: 'Focused Math Intervention' }
    ])
  end

  def self.add_somerville_heggerty_service_types
    ServiceType.create!([
      { id: 601, name: 'SPS Heggerty, week 1' },
      { id: 602, name: 'SPS Heggerty, week 5' },
      { id: 603, name: 'SPS Heggerty, week 9' },
      { id: 604, name: 'SPS Heggerty, week 13' }
    ])
  end

  def self.add_bedford_service_types
    ServiceType.create!([{
      id: 701,
      name: 'Title 1 Math intervention',
      description: 'Title One Math afterschool program',
      intensity: '2 x 45',
      data_owner: 'AP at Lane, this is only a Lane program'
    }, {
      id: 702,
      name: "Lunch bunch",
      description: "Small group lunch bunch with counseling staff focusing on social skills",
      intensity: "1x20min",
      data_owner: "counselor"
    }, {
      id: 703,
      name: "Soc.emo check in",
      description: "Short regular check ins",
      intensity: "1-3x 10min",
      data_owner: "counselor"
    }, {
      id: 704,
      name: "Individual Counseling",
      description: "1:1 counseling sessions",
      intensity: "1x30 min",
      data_owner: "counselor"
    }, {
      id: 705,
      name: "Social Group",
      description: "Small groups",
      intensity: "1 or 2 x 30",
      data_owner: "counselor"
    }, {
      id: 706,
      name: "Reading intervention, with specialist",
      description: "Specific documented reading intervention",
      intensity: "2-3 x 30",
      data_owner: "specialist"
    }, {
      id: 707,
      name: "LLI Reading Instruction",
      description: "Leveled Literacy Instruction by trained staff",
      intensity: "5x30",
      data_owner: "specialist"
    }, {
      id: 708,
      name: "Math Intervention, small group",
      description: "Interventions developed with math CC, typically delivered in small group, occasionally one on one",
      intensity: "Varies 2-5x per week",
      data_owner: "Classroom staff w/ math CC consult"
    }, {
      id: 709,
      name: 'Formal Behavior Plan',
      description: 'Behavior plan written by or in consultation with BCBA',
      intensity: 'varies',
      data_owner: 'BCBA'
    }])
  end

  # From doc: Somerville services (10/21/19)
  def self.update_somerville_descriptions
    service_type_rows = [{
      id: 502,
      name: "Attendance Officer",
      description: "This usually includes home visits, regular follow-up, and could later on lead to a formal attendance contract.",
      intensity: nil,
      data_owner: "Attendance officer, in SST Meetings"
    }, {
      id: 503,
      name: "Attendance Contract",
      description: "This is usually done in cooperation with the attendance officer, school adjustment counselor, and/or principal. This is a more formal document that requires a parent and student signature, along with regular checkpoints.",
      intensity: nil,
      data_owner: "Attendance officer, principal or assistant principal, in SST meetings"
    }, {
      id: 504,
      name: "Behavior Contract",
      description: "This is usually done in cooperation with the attendance officer, school adjustment counselor, and/or principal. This is a more formal document that requires a parent and student signature, along with regular checkpoints.",
      intensity: nil,
      data_owner: "Principal, assistant principal or counselor"
    }, {
      id: 505,
      name: "Counseling, in-house",
      description: "Student receives regular weekly or bi-weekly counseling from an SPS counselor. One time or infrequent check-ins by a counselor should just be recorded in Notes.",
      intensity: "Weekly or Bi-Weekly",
      data_owner: "Counselor",
    }, {
      id: 506,
      name: "Counseling, outside",
      description: "Student receives regular weekly or bi-weekly counseling from an outside counselor, ex. Riverside, Home for Little Wanderers. One time or infrequent check-ins by a counselor should just be recorded in Notes.",
      intensity: "Weekly or Bi-Weekly",
      data_owner: "Counselor"
    }, {
      id: 507,
      name: "Reading intervention",
      description: "Student works with a reading specialist at least 4x/week for 40 minutes.",
      intensity: "4 x 40m",
      data_owner: "Reading teacher, in MTSS meetings"
    }, {
      id: 508,
      name: "Math intervention",
      description: nil,
      intensity: nil,
      data_owner: nil
    }, {
      id: 509,
      name: "SomerSession",
      description: "4 week summer program that uses ELA and Math interventions to target specific standards from the previous grade level that have yet to be mastered.  Also includes a project-based learning component.",
      intensity: "4 weeks",
      data_owner: "Director of SomerSession"
    }, {
      id: 510,
      name: "Summer Program for English Language Learners",
      description: "4 week summer program for English Language Learners at Levels 1-3 focusing on reading, writing, speaking, and listening skills",
      intensity: "4 weeks",
      data_owner: "Director of SPELL"
    }, {
      id: 511,
      name: "Afterschool Tutoring",
      description: "Student is receiving 25 hours of afterschool tutoring math or reading services in a small group through Title I.",
      intensity: "25 hours afterschool",
      data_owner: "K-8 Curriculum Coordinator",
    }, {
      id: 512,
      name: "Freedom School",
      description: nil,
      intensity: nil,
      data_owner: nil
    }, {
      id: 513,
      name: "Community Schools",
      description: nil,
      intensity: nil,
      data_owner: nil
    }, {
      id: 514,
      name: "X-Block",
      description: nil,
      intensity: nil,
      data_owner: nil
    }, {
      id: 515,
      name: "Calculus Project",
      description: "3 week summer program students in grades 7-9 designed to provide a 'boost' in math, increase confidence, and prepare them to take higher level math courses.",
      intensity: "3 weeks",
      data_owner: "Calculus Project Coordinator"
    }, {
      id: 516,
      name: "Boston Breakthrough",
      description: "6 week intensive summer program with coaching throughout the year designed to prepare students and their families to succeed and persevere in college and career",
      intensity: "6 weeks",
      data_owner: "Boston Breakthrough Director"
    }, {
      id: 517,
      name: "Summer Explore",
      description: "5 week program for pre-K and K students designed to help prepare them to make the transition to the next grade level",
      intensity: "5 weeks",
      data_owner: "Director of Early Childhood"
    }, {
      id: 518,
      name: "Focused Math Intervention",
      description: "A 10 week small intervention program provided by a tutor designed to help students master specific standards from the previous grade level",
      intensity: "3-4 days a week for 40 minutes",
      data_owner: "K-8 Curriculum Coordinator"
    }, {
      id: 601,
      name: "SPS Heggerty, week 1",
      description: "A scripted Phonological Awareness intervention program that addresses segmenting, blending, deleting, and substituting at the word, syllable, and phoneme level.  Students are placed into the correct level using the PAST assessment.",
      intensity: "3-4 days a week for 10 minutes",
      data_owner: "K-8 Curriculum Coordinator, Reading teachers, or ELA Coaches"
    }, {
      id: 602,
      name: "SPS Heggerty, week 5",
      description: "A scripted Phonological Awareness intervention program that addresses segmenting, blending, deleting, and substituting at the word, syllable, and phoneme level.  Students are placed into the correct level using the PAST assessment.",
      intensity: "3-4 days a week for 10 minutes",
      data_owner: "K-8 Curriculum Coordinator, Reading teachers, or ELA Coaches"
    }, {
      id: 603,
      name: "SPS Heggerty, week 9",
      description: "A scripted Phonological Awareness intervention program that addresses segmenting, blending, deleting, and substituting at the word, syllable, and phoneme level.  Students are placed into the correct level using the PAST assessment.",
      intensity: "3-4 days a week for 10 minutes",
      data_owner: "K-8 Curriculum Coordinator, Reading teachers, or ELA Coaches"
    }, {
      id: 604,
      name: "SPS Heggerty, week 13",
      description: "A scripted Phonological Awareness intervention program that addresses segmenting, blending, deleting, and substituting at the word, syllable, and phoneme level.  Students are placed into the correct level using the PAST assessment.",
      intensity: "3-4 days a week for 10 minutes",
      data_owner: "K-8 Curriculum Coordinator, Reading teachers, or ELA Coaches"
    }]
    ServiceType.transaction do
      service_type_rows.each do |service_type_row|
        service = ServiceType.find(service_type_row[:id])
        service.update!(service_type_row)
      end
    end
  end
end
