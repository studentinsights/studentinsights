class Assessment < ActiveRecord::Base
  has_many :mcas_results, dependent: :destroy
  has_many :students, through: :mcas_results
end
