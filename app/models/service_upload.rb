class ServiceUpload < ApplicationRecord
  belongs_to :uploaded_by_educator, class_name: 'Educator'
  has_many :services, dependent: :destroy

  validates :uploaded_by_educator, presence: true
  validates :file_name, presence: true, uniqueness: true
end
