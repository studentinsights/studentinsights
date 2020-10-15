# An upload that an Insights user performed.  It probably created some `StudentVoiceCompletedSurveys`
# Can also have created 'StudentVoiceCompletedSurveys2020'
class StudentVoiceSurveyUpload < ApplicationRecord
  belongs_to :uploaded_by_educator, class_name: 'Educator'
  has_many :student_voice_completed_surveys, dependent: :destroy
  has_many :student_voice_completed2020_surveys, dependent: :destroy
  has_many :students, -> { distinct }, through: :student_voice_completed_surveys
  has_many :students, -> { distinct }, through: :student_voice_completed_2020_surveys

  validates :uploaded_by_educator, presence: true
  validates :file_name, presence: true
  validates :file_size, presence: true
  validates :file_digest, presence: true
  validates :stats, presence: true
end
