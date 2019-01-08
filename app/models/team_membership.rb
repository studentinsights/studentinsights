class TeamMembership < ApplicationRecord
  belongs_to :student

  validates :student, presence: true
  validates :activity_text, presence: true, exclusion: { in: ['']}
  validates :coach_text, presence: true, exclusion: { in: ['']}
  validates :school_year_text, presence: true, format: {
    with: /\A(20\d\d)-(\d\d)\z/,
    message: 'must be format 2002-03'
  }

  def active(options = {})
    time_now = options.fetch(:time_now, Time.now)
    this_school_year = SchoolYear.to_school_year(time_now)
    short_next_school_year = (this_school_year + 1).to_s.last(2)
    school_year_text = "#{this_school_year}-#{short_next_school_year}"
    this_season_key = PerDistrict.new.sports_season_key(time_now)

    self.school_year_text == school_year_text && self.season_key == this_season_key.to_s
  end
end
