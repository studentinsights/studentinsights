class Student < ApplicationRecord
  VALID_FREE_REDUCED_LUNCH_VALUES = [
    "Free Lunch",
    "Not Eligible",
    "Reduced Lunch",
    nil
  ].freeze

  # Model for a student in the district, backed by information in the database.
  # Class methods (self.active) concern collections of students,
  # and instance methods (latest_mcas_mathematics) concern a single student.
  #
  # Contrast with student_row.rb, which represents a row imported from X2,
  # (not necessarily in the database yet).

  belongs_to :homeroom, optional: true
  belongs_to :school

  has_many :student_assessments, dependent: :destroy
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_many :event_notes, dependent: :destroy
  has_many :transition_notes, dependent: :destroy
  has_many :second_transition_notes, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :tardies, dependent: :destroy
  has_many :absences, dependent: :destroy
  has_many :discipline_incidents, dependent: :destroy
  has_many :iep_documents, dependent: :destroy
  has_many :ed_plans, dependent: :destroy
  has_many :homework_help_sessions, dependent: :destroy
  has_many :star_math_results, -> { order(date_taken: :desc) }, dependent: :destroy
  has_many :star_reading_results, -> { order(date_taken: :desc) }, dependent: :destroy
  has_many :dibels_results, -> { order(date_taken: :desc) }, dependent: :destroy
  has_many :f_and_p_assessments, dependent: :destroy
  has_many :reading_benchmark_data_points, dependent: :destroy
  has_many :student_photos
  has_many :student_section_assignments
  has_many :sections, through: :student_section_assignments

  validates :local_id, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :school, presence: true
  validates :grade, inclusion: { in: GradeLevels::ORDERED_GRADE_LEVELS }
  validates :plan_504, inclusion: { in: PerDistrict.new.valid_plan_504_values }
  validates :free_reduced_lunch, inclusion: { in: Student::VALID_FREE_REDUCED_LUNCH_VALUES }
  validate :validate_registration_date_cannot_be_in_future

  # nullable but not empty strings
  validates :enrollment_status, exclusion: { in: ['']}
  validates :home_language, exclusion: { in: ['']}
  validates :program_assigned, exclusion: { in: ['']}
  validates :limited_english_proficiency, exclusion: { in: ['']}
  validates :sped_placement, exclusion: { in: ['']}
  validates :disability, exclusion: { in: ['']}
  validates :sped_level_of_need, exclusion: { in: ['']}
  validates :student_address, exclusion: { in: ['']}
  validates :race, exclusion: { in: ['']}
  validates :hispanic_latino, exclusion: { in: ['']}
  validates :gender, exclusion: { in: ['']}
  validates :primary_phone, exclusion: { in: ['']}
  validates :primary_email, exclusion: { in: ['']}
  validates :sped_liaison, exclusion: { in: ['']}
  validates :house, exclusion: { in: ['']}
  validates :counselor, exclusion: { in: ['']}

  # `enrollment_status` is from the SIS export, while `missing_from_last_export`
  # indicates the student was missing from the last export where we expected to
  # find them, so we treat them as no longer active.
  #
  # All product features should be scoped to `active` students only.
  def self.active
    where(enrollment_status: 'Active', missing_from_last_export: false)
  end

  # Support deriving this and overriding it based on other
  # data sources (eg, the document itself).
  # This can trigger another query.
  def plan_504(options = {})
    return attributes['plan_504'] if options[:force]
    PerDistrict.new.patched_plan_504(self)
  end

  def has_photo
    self.student_photos.size > 0
  end

  def active?
    enrollment_status == 'Active' && !missing_from_last_export
  end

  def teams(options = {})
    TeamMembership.where(student_id: self.id)
  end

  def latest_iep_document
    self.iep_documents.order(created_at: :desc).limit(1).first
  end

  ## ABSENCES / TARDIES ##

  def most_recent_school_year_discipline_incidents_count
    discipline_incidents.where(
      'occurred_at >= ?', SchoolYear.first_day_of_school_for_time(Time.now)
    ).count
  end

  def most_recent_school_year_absences_count
    absences.where(
      'occurred_at >= ?', SchoolYear.first_day_of_school_for_time(Time.now)
    ).count
  end

  def most_recent_school_year_tardies_count
    tardies.where(
      'occurred_at >= ?', SchoolYear.first_day_of_school_for_time(Time.now)
    ).count
  end

  # deprecated
  # Maybe include a restricted note, but cannot return any restricted data
  def latest_note
    event_notes.order(recorded_at: :desc).limit(1).first.as_json(only: [:event_note_type_id, :recorded_at])
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

  def latest_dibels
    dibels_results.first  # Sorted by descending date_taken by default
  end

  def access
    access_data_points = self.student_assessments.by_family('ACCESS').order_by_date_taken_asc
    grouped_by_subject = access_data_points.group_by(&:subject)

    pairs = [:composite, :comprehension, :literacy, :oral, :listening, :reading, :speaking, :writing].map do |category|
      subject = category.to_s.capitalize
      latest_data_point = grouped_by_subject[subject].try(:last)
      data_point_json = latest_data_point.try(:as_json, only: [:performance_level, :date_taken])
      [category, data_point_json]
    end
    pairs.to_h
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

  def winter_reading_doc(options = {})
    time_now = options.fetch(:time_now, Time.now)
    benchmark_school_year = SchoolYear.to_school_year(time_now)
    ReadingBenchmarkDataPoint.doc_for(self.id, benchmark_school_year, :winter)
  end

  def update_recent_student_assessments!
    update!({
      most_recent_mcas_math_growth: latest_mcas_mathematics.growth_percentile,
      most_recent_mcas_ela_growth: latest_mcas_ela.growth_percentile,
      most_recent_mcas_math_performance: latest_mcas_mathematics.performance_level,
      most_recent_mcas_ela_performance: latest_mcas_ela.performance_level,
      most_recent_mcas_math_scaled: latest_mcas_mathematics.scale_score,
      most_recent_mcas_ela_scaled: latest_mcas_ela.scale_score,
      most_recent_star_reading_percentile: star_reading_results.first.try(:percentile_rank),
      most_recent_star_math_percentile: star_math_results.first.try(:percentile_rank)
    })
  end

  def self.update_recent_student_assessments!
    find_each do |student|
      student.update_recent_student_assessments!
    end
  end

  def event_notes_without_restricted
    event_notes.where(is_restricted: false)
  end

  private
  def registration_date_in_future?
    return false if registration_date.nil?

    return false if DateTime.now > registration_date

    return true
  end

  def validate_registration_date_cannot_be_in_future
    if registration_date_in_future?
      errors.add(:registration_date, "cannot be in future for student local id ##{local_id}")
    end
  end
end
