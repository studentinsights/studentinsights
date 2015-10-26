class ProgressNote < ActiveRecord::Base
  belongs_to :intervention
  belongs_to :educator
  validates_presence_of :content, :intervention_id, :educator_id
end
