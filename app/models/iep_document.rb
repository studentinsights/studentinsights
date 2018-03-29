class IepDocument < ActiveRecord::Base
  belongs_to :student
  validates :file_name, presence: true, uniqueness: true
end
