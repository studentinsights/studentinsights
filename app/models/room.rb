class Room < ActiveRecord::Base
  has_many :students
end
