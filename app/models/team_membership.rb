class TeamMembership < ActiveRecord::Base
  belongs_to :student

  validates :student, presence: true
  validates :activity_text, presence: true, exclusion: { in: ['']}
  validates :coach_text, presence: true, exclusion: { in: ['']}
  validates :school_year_text, presence: true, format: {
    with: /\A(20\d\d)-(\d\d)\z/,
    message: 'must be format 2002-03'
  }

  def self.active(options = {})
    time_now = options.fetch(:time_now, Time.now)
    this_school_year = SchoolYear.to_school_year(time_now)
    short_next_school_year = (this_school_year + 1).to_s.last(2)
    school_year_text = "#{this_school_year}-#{short_next_school_year}"
    self.where(school_year_text: school_year_text)
  end
end
