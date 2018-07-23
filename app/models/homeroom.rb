class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  validates :name, presence: true, uniqueness: { scope: [:name, :school] }
  validates :slug, uniqueness: true, presence: true
  validates :school, presence: true
  has_many :students, after_add: :update_grade
  belongs_to :educator, optional: true
  belongs_to :school

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

end
