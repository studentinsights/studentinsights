class EdPlan < ApplicationRecord
  belongs_to :student

  validates :student, presence: true
  validates :sep_oid, presence: true, uniqueness: true
end
