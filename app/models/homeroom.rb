class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  validates :name, uniqueness: true
  validates :slug, uniqueness: true
  has_many :students, after_add: :update_grade
  belongs_to :educator

  def update_grade(student)
    # Set homeroom grade level to be first student's grade level
    return if self.grade.present?
    update_attribute(:grade, student.grade)
  end
end
