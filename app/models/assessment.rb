class Assessment < ActiveRecord::Base
  has_many :student_results, dependent: :destroy
  has_many :students, through: :student_results
end
