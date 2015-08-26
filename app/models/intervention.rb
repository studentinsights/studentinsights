class Intervention < ActiveRecord::Base
  belongs_to :student
  belongs_to :educator
  belongs_to :intervention_type
  validates_presence_of :student_id, :intervention_type_id, :start_date
  delegate :name, to: :intervention_type
end
