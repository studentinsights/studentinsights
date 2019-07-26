# typed: strong
class CounselorMeeting < ApplicationRecord
  belongs_to :educator
  belongs_to :student

  validates :educator, :student, :meeting_date, presence: true
end
