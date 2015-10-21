class Intervention < ActiveRecord::Base
  belongs_to :student
  belongs_to :educator
  belongs_to :intervention_type
  belongs_to :school_year
  has_many :progress_notes
  validates_presence_of :student_id, :intervention_type_id, :start_date
  delegate :name, to: :intervention_type
  include DateToSchoolYear
  include AssignToSchoolYear
  before_save :assign_to_school_year
end
