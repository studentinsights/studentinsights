class StudentNote < ActiveRecord::Base
  belongs_to :student
  belongs_to :educator
  validates :student, :educator, presence: true
  validates_presence_of :content
end
