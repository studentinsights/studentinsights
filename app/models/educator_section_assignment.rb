class EducatorSectionAssignment < ActiveRecord::Base
  belongs_to :educator
  belongs_to :section
end
