class Assessment < ActiveRecord::Base
  belongs_to :assessment_family
  belongs_to :assessment_subject
  belongs_to :student
end
