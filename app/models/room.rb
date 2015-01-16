class Room < ActiveRecord::Base
  has_many :students
  validates_uniqueness_of :name
end
