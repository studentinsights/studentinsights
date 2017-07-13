class IepDocument < ActiveRecord::Base
  belongs_to :student
  validates :file_name, uniqueness: { scope: :file_date, message: "one unique file name per date" }
end
