class Section < ActiveRecord::Base
  validates :section_number, presence: true, uniqueness: { scope: [:section_number, :course_id, :school_id, :term_local_id] }
  validates :school, presence: true
  validates :course, presence: true
  belongs_to :school
  belongs_to :course
end