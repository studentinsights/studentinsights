class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  has_many :students
  belongs_to :educator
end
