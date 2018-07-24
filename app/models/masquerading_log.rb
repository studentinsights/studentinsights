# Logs when the user masquerades as another other
# or clears.
class MasqueradingLog < ActiveRecord::Base
  belongs_to :educator
  belongs_to :masquerading_as_educator, class_name: 'Educator'

  validates :educator, presence: true
  validates :masquerading_as_educator, presence: true
  validates :action, presence: true

  validates_inclusion_of :action, :in => ['become', 'clear'], :allow_nil => false
end
