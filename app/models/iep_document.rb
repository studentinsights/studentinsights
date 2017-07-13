class IepDocument < ActiveRecord::Base
  belongs_to :student
  validates :file_name, uniqueness: true
end
