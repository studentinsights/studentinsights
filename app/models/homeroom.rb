class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  validates :name, uniqueness: true
  validates :slug, uniqueness: true
  has_many :students, after_add: :update_grade
  has_many :student_risk_levels, through: :students
  belongs_to :educator

  def update_grade(student)
    # Set homeroom grade level to be first student's grade level, since
    # we don't have any crosswalk between homerooms and grades in
    # Somerville's Student Information System

    return if self.grade.present?
    return if student.grade.blank?
    update_attribute(:grade, student.grade)
  end

  def show_dibels?
    return true if grade.blank?  # Default to show
    grade.to_i <= 4  # DIBELS is given K-3, show through grade 4
  end

  def show_mcas?
    return true if grade.blank?  # Default to show
    grade.to_i >= 3  # MCAS is given 3–8, 10
  end

  def show_star?
    return true if grade.blank?  # Default to show
    grade.to_i >= 2  # STAR is given 2–8
  end

  def self.destroy_empty_homerooms
    Homeroom.where(students_count: 0).destroy_all
  end

  def average_mcas_math_score
    most_recent_mcas_math_scores = students.map(&:most_recent_mcas_math_scaled).compact
    number_of_scores = most_recent_mcas_math_scores.size
    return nil if number_of_scores == 0
    (most_recent_mcas_math_scores.reduce(:+).to_f / number_of_scores).round(0)
  end

  def average_mcas_ela_score
    most_recent_mcas_math_scores = students.map(&:most_recent_mcas_ela_scaled).compact
    number_of_scores = most_recent_mcas_math_scores.size
    return nil if number_of_scores == 0
    (most_recent_mcas_math_scores.reduce(:+).to_f / number_of_scores).round(0)
  end

end
