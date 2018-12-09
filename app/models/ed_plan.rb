class EdPlan < ApplicationRecord
  belongs_to :student
  has_many :ed_plan_accommodations

  validates :student, presence: true
  validates :sep_oid, presence: true, uniqueness: true
end
