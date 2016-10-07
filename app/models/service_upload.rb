class ServiceUpload < ActiveRecord::Base
  belongs_to :uploaded_by_educator, class_name: 'Educator'
  has_many :services, dependent: :destroy

  validates_presence_of :file_name
  validates_uniqueness_of :file_name
end
