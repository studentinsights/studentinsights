class EdPlan < ApplicationRecord
  belongs_to :student
  has_many :ed_plan_accommodations, dependent: :destroy

  validates :student, presence: true
  validates :sep_oid, presence: true, uniqueness: true
  validates :sep_effective_date, presence: true
  validates :sep_fieldd_006, presence: true

  def self.active
    where(sep_status: SEP_STATUS_MAP[:active])
  end

  def specific_disability
    sep_fieldd_006
  end

  def persons_responsible
    sep_fieldd_007
  end

  private
  SEP_STATUS_MAP = {
    draft: 0,
    active: 1,
    previous: 2,
    rejected: 3,
    discarded: 4
  }
end
