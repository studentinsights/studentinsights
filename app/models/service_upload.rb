class ServiceUpload < ActiveRecord::Base
  belongs_to :uploaded_by_educator, class_name: 'Educator'
  has_many :services

  validates_presence_of :uploaded_by_educator_id
end
