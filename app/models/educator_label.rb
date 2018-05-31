# For tagging educators with particular labels (eg, for
# membership into different educators cohorts like NGE).
class EducatorLabel < ActiveRecord::Base
  belongs_to :educator
  validates :educator, presence: true
  validates :label_key, {
    presence: true,
    uniqueness: { scope: [:label_key, :educator] },
    inclusion: {
      in: [
        'shs_experience_team', 'k8_counselor', 'high_school_house_master'
      ]
    }
  }
end
