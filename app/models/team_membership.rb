class TeamMembership < ActiveRecord::Base
  belongs_to :student

  validates :student, presence: true
  validates :activity_text, presence: true, exclusion: { in: ['']}
  validates :coach_text, presence: true, exclusion: { in: ['']}
  validates :school_year_text, presence: true, exclusion: { in: ['']}

  def self.active(options = {})
    time_now = options.fetch(:time_now, Time.now)
    this_school_year = SchoolYear.to_school_year(time_now)
    self.where(school_year_text: "#{this_school_year}-#{this_school_year + 1}")
  end
end
