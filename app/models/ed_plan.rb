class EdPlan < ApplicationRecord
  belongs_to :student
  has_many :ed_plan_accommodations, dependent: :destroy

  validates :student, presence: true
  validates :sep_oid, presence: true, uniqueness: true

  def date_of_implementation
    sep_effective_date
  end

  def specific_disability
    sep_fieldd_006
  end

  def persons_responsible
    sep_fieldd_007
  end
end
