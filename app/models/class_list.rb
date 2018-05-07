class ClassList < ActiveRecord::Base
  has_one :school
  has_one :created_by_educator

  validates :grade_level_next_year, presence: true
  validates :school_id, presence: true
  validates :created_by_educator_id, presence: true
end
