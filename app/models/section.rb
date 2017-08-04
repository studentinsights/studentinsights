class Section < ActiveRecord::Base
  validates :section_number, presence: true, uniqueness: { scope: [:section_number, :course_id, :term_local_id] }
  validates :course, presence: true
  belongs_to :course
end