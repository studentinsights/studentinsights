class Intervention < ActiveRecord::Base
  include DateToSchoolYear
  belongs_to :student
  belongs_to :educator
  belongs_to :intervention_type
  belongs_to :school_year
  has_many :progress_notes, dependent: :destroy
  before_save :assign_to_school_year
  validates_presence_of :student_id, :intervention_type_id, :start_date
  validate :end_date_cannot_come_before_start_date
  delegate :name, to: :intervention_type

  def assign_to_school_year
    self.school_year = date_to_school_year(start_date)
  end

  def end_date_cannot_come_before_start_date
    if end_date.present?
      if end_date < start_date
        errors.add(:end_date, "can't be before start date")
      end
    end
  end
end
