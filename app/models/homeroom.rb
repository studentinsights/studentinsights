class Homeroom < ActiveRecord::Base
  has_many :students
  belongs_to :educator
end
