class EducatorSectionAssignment < ActiveRecord::Base
  belongs_to :educator
  belongs_to :section

  validates :educator_id, presence: true
  validate :section_id, presence: true
end
