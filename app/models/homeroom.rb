class Homeroom < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: :slugged
  validates :name, uniqueness: true
  validates :slug, uniqueness: true
  has_many :students
  belongs_to :educator
end
