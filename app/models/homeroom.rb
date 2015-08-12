class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  validates :name, uniqueness: true
  validates :slug, uniqueness: true
  has_many :students
  belongs_to :educator

  def grade
    if students.present?
      student_grade = students.first.grade    # All students in a homeroom should have same grade level
      student_grade.to_i if student_grade.present?
    end
  end
end
