# typed: strong
class EdPlanAccommodation < ApplicationRecord
  belongs_to :ed_plan

  validates :ed_plan, presence: true
  validates :iac_oid, presence: true, uniqueness: true
end
