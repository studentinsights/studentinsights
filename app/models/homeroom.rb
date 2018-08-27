class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged

  belongs_to :educator, optional: true
  belongs_to :school

  validates :name, presence: true, uniqueness: { scope: [:name, :school] }
  validates :slug, presence: true, uniqueness: true
  validates :school, presence: true

  has_many :students, after_add: :update_grade

  validate :validate_school_matches_educator_school

  private
  def update_grade(student)
    # Set homeroom grade level to be first student's grade level, since
    # we don't have any crosswalk between homerooms and grades in
    # Somerville's Student Information System

    return if self.grade.present?
    return if student.grade.blank?
    update_attribute(:grade, student.grade)
  end

  def validate_school_matches_educator_school
    if educator.present? && educator.school.present?
      if educator.school != school
        errors.add(:school, 'does not match educator\'s school')
      end
    end
  end
end
