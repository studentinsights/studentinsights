class Course < ActiveRecord::Base
  validates :local_id, presence: true, uniqueness: { scope: [:local_id, :school_id] }
  validates :school, presence: true
  has_many :sections
  belongs_to :school
end