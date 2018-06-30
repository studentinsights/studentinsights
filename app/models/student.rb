class Student < ActiveRecord::Base
  # Model for a student in the district, backed by information in the database.
  # Class methods (self.active) concern collections of students,
  # and instance methods (latest_mcas_mathematics) concern a single student.
  #
  # Contrast with student_row.rb, which represents a row imported from X2,
  # (not necessarily in the database yet).

  belongs_to :homeroom, optional: true, counter_cache: true
  belongs_to :school
  has_many :student_photos
  has_many :student_assessments, dependent: :destroy
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_many :event_notes, dependent: :destroy
  has_many :transition_notes, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :tardies, dependent: :destroy
  has_many :absences, dependent: :destroy
  has_many :discipline_incidents, dependent: :destroy
  has_one :iep_document, dependent: :destroy
  has_many :student_section_assignments
  has_many :sections, through: :student_section_assignments

  has_many :dashboard_tardies, -> {
    where('occurred_at >= ?', 1.year.ago)
  }, class_name: "Tardy"
  has_many :dashboard_absences, -> {
    where('occurred_at >= ?', 1.year.ago)
  }, class_name: "Absence"

  has_many :sst_notes, -> { where(event_note_type_id: 300) }, class_name: "EventNote"

  has_one :student_risk_level, dependent: :destroy

  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  validates :first_name, presence: true
  validates :last_name, presence: true
  validate :validate_grade
  validate :registration_date_cannot_be_in_future
  validate :validate_free_reduced_lunch

  VALID_GRADES = [
    'PPK', 'PK', 'KF', 'SP', 'TK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'
  ].freeze

  VALID_FREE_REDUCED_LUNCH_VALUES = [
    "Free Lunch",
    "Not Eligible",
    "Reduced Lunch",
    nil
  ]

  def registration_date_in_future
    return false if registration_date.nil?

    return false if DateTime.now > registration_date

    return true
  end

  def registration_date_cannot_be_in_future
    if registration_date_in_future
      errors.add(:registration_date, "cannot be in future for student local id ##{local_id}")
    end
  end

  def self.with_school
    where.not(school: nil)
  end

  def self.active
    where(enrollment_status: 'Active')
  end

  def active?
    enrollment_status == 'Active'
  end

  ## ABSENCES / TARDIES ##

  def most_recent_school_year_discipline_incidents_count
    discipline_incidents.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def most_recent_school_year_absences_count
    absences.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def most_recent_school_year_tardies_count
    tardies.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def events_by_student_school_years(filter_to_date, filter_from_date)
    sorter = StudentSchoolYearSorter.new(student: self)

    sorter.sort_and_filter(filter_to_date, filter_from_date)
  end

  ## STUDENT ASSESSMENT RESULTS ##

  def latest_result_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .by_family_and_subject(family_name, subject_name)
        .order_by_date_taken_asc
        .last
  end

  def ordered_results_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .by_family_and_subject(family_name, subject_name)
        .order_by_date_taken_asc
  end

  def ordered_results_by_family(family_name)
    self.student_assessments
        .by_family(family_name)
        .order_by_date_taken_asc
  end

  def mcas_mathematics_results
    ordered_results_by_family_and_subject("MCAS", "Mathematics")
  end

  def mcas_ela_results
    ordered_results_by_family_and_subject("MCAS", "ELA")
  end

  def next_gen_mcas_mathematics_results
    ordered_results_by_family_and_subject("Next Gen MCAS", "Mathematics")
  end

  def next_gen_mcas_ela_results
    ordered_results_by_family_and_subject("Next Gen MCAS", "ELA")
  end

  def star_reading_results
    ordered_results_by_family_and_subject("STAR", "Reading")
  end

  def star_math_results
    ordered_results_by_family_and_subject("STAR", "Mathematics")
  end

  def dibels
    ordered_results_by_family("DIBELS")
  end

  def latest_dibels
    ordered_results_by_family("DIBELS").last
  end

  def latest_access_results
    return if latest_result_by_family_and_subject('ACCESS', 'Composite').nil?

    access_categories = [ :composite, :comprehension, :literacy, :oral, :listening, :reading, :speaking, :writing, ]

    access_categories.map do |category|
      [category, latest_result_by_family_and_subject('ACCESS', category.to_s.capitalize).try(:performance_level)]
    end.to_h

  end

  def latest_mcas_mathematics
    latest_result_by_family_and_subject(["Next Gen MCAS", "MCAS"], "Mathematics") || MissingStudentAssessment.new
  end

  def latest_mcas_ela
    latest_result_by_family_and_subject(["Next Gen MCAS", "MCAS"], "ELA") || MissingStudentAssessment.new
  end

  def latest_star_mathematics
    latest_result_by_family_and_subject("STAR", "Mathematics") || MissingStudentAssessment.new
  end

  def latest_star_reading
    latest_result_by_family_and_subject("STAR", "Reading") || MissingStudentAssessment.new
  end

  # This is optimized to run across all students at once, after an import job
  def self.update_recent_student_assessments!
    # These are the assessments that are indexed
    assessments = {
      mcas_math: Assessment.find_by(family: 'MCAS', subject: 'Mathematics').id,
      mcas_math_next_gen: Assessment.find_by(family: 'Next Gen MCAS', subject: 'Mathematics').id,
      mcas_ela: Assessment.find_by(family: 'MCAS', subject: 'ELA').id,
      mcas_ela_next_gen: Assessment.find_by(family: 'Next Gen MCAS', subject: 'ELA').id,
      star_reading: Assessment.find_by(family: 'STAR', subject: 'Reading').id,
      star_math: Assessment.find_by(family: 'STAR', subject: 'Mathematics').id
    }
    assessment_ids = assessments.values
    raise "Did not find expected Assessment records" unless assessments.keys.size == assessment_ids.compact.size

    # Batch query for all records across all students.
    # Ordering matters here so we can `find` through the array to get the most recent.
    student_assessment_tuples = StudentAssessment
      .where(assessment_id: assessment_ids)
      .order(date_taken: :desc)
      .pluck(*[
        :student_id,
        :assessment_id,
        :growth_percentile,
        :performance_level,
        :scale_score,
        :percentile_rank,
        :date_taken
      ]) # the order of these fields matters

    # Group by student, so we can do a single update for each `Student` record.
    tuples_by_student_id = student_assessment_tuples.group_by {|tuple| tuple[0] }
    students = Student.where(id: tuples_by_student_id.keys)
    tuples_by_student_id.each do |student_id, tuples|
      # Find latest scores for the relevant assessments
      mcas_math_tuple = tuples.find {|tuple| assessments.values_at(:mcas_math, :mcas_math_next_gen).include?(tuple[1]) }
      mcas_ela_tuple = tuples.find {|tuple| assessments.values_at(:mcas_ela, :mcas_ela_next_gen).include?(tuple[1]) }
      star_reading_tuple = tuples.find {|tuple| assessments.values_at(:star_reading).include?(tuple[1]) }
      star_math_tuple = tuples.find {|tuple| assessments.values_at(:star_math).include?(tuple[1]) }

      # Update the record in memory
      student = students.find {|s| s.id == student_id }
      student.assign_attributes({
        most_recent_mcas_math_growth: mcas_math_tuple.try(:[], 2),
        most_recent_mcas_math_performance: mcas_math_tuple.try(:[], 3),
        most_recent_mcas_math_scaled: mcas_math_tuple.try(:[], 4),
        most_recent_mcas_ela_growth: mcas_ela_tuple.try(:[], 2),
        most_recent_mcas_ela_performance: mcas_ela_tuple.try(:[], 3),
        most_recent_mcas_ela_scaled: mcas_ela_tuple.try(:[], 4),
        most_recent_star_reading_percentile: star_reading_tuple.try(:[], 5),
        most_recent_star_math_percentile: star_math_tuple.try(:[], 5)
      })
    end

    # If anything changed, save
    touched_students = []
    students.each do |student|
      next unless student.changed?
      student.save!
      touched_students << student
    end
    touched_students
  end

  def self.with_mcas_math
    where.not(most_recent_mcas_math_performance: nil)
  end

  def self.with_mcas_math_warning
    where(most_recent_mcas_math_performance: 'W')
  end

  def self.with_mcas_ela
    where.not(most_recent_mcas_ela_performance: nil)
  end

  def self.with_mcas_ela_warning
    where(most_recent_mcas_ela_performance: 'W')
  end

  ## RISK LEVELS ##

  def self.update_risk_levels!
    # This method is meant to be called daily to
    # check for updates to all student's risk levels
    # and save the results to the db (too expensive
    # to calculate on the fly with each page load).
    find_each { |s| s.update_risk_level! }
  end

  # Update or create, and cache
  def update_risk_level!
    if student_risk_level.present?
      student_risk_level.update_risk_level!
    else
      self.student_risk_level = StudentRiskLevel.new(student_id: id)
      self.student_risk_level.save!
    end

    # Cache risk level to the student table
    if self.risk_level != student_risk_level.level
      self.risk_level = student_risk_level.level
      self.save!
    end
  end

  # SpEd Data as defined by Somerville Schools

  def sped_data
    {
      sped_level: sped_level,
      sped_tooltip_message: sped_tooltip_message,
      sped_bubble_class: sped_bubble_class
    }
  end

  def sped_level
    case self.sped_level_of_need
    when "Low < 2"
      "1"
    when "Low >= 2"
      "2"
    when "Moderate"
      "3"
    when "High"
      "4"
    else
      "—"
    end
  end

  def sped_tooltip_message
    case sped_level
    when "1"
      "#{self.first_name} receives 0-2 hours of special education services per week."
    when "2"
      "#{self.first_name} receives 2-5 hours of special education services per week."
    when "3"
      "#{self.first_name} receives 6-14 hours of special education services per week."
    when "4"
      "#{self.first_name} receives 15+ hours of special education services per week."
    else
      nil
    end
  end

  def sped_bubble_class
    case sped_level
    when "—"
      "sped"
    else
      "warning-bubble sped-risk-bubble tooltip"
    end
  end

  def event_notes_without_restricted
    event_notes.where(is_restricted: false)
  end

  # Sections
  def sections_with_grades
    sections.select("sections.*, student_section_assignments.grade_numeric")
  end

  private
  def this_year
    DateTime.now.year
  end

  def august_of_this_year
    DateTime.new(this_year, 8, 1)
  end

  def start_of_this_school_year
    if august_of_this_year > DateTime.now
      DateTime.new(this_year - 1, 8, 1)
    else
      august_of_this_year
    end
  end

  def validate_free_reduced_lunch
    errors.add(:free_reduced_lunch, "unexpected value: #{free_reduced_lunch}") unless free_reduced_lunch.in?(VALID_FREE_REDUCED_LUNCH_VALUES)
  end

  def validate_grade
    errors.add(:grade, "invalid grade: #{grade}") unless grade.in?(VALID_GRADES)
  end

  def validate_plan_504
    errors.add(:plan_504, "invalid plan_504: #{plan_504}") unless grade.in?(PerDistrict.new.valid_plan_504_values)
  end
end
