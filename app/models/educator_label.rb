class EducatorLabel < ActiveRecord::Base
  belongs_to :educator
  validates_presence_of :educator, :label_key
end
