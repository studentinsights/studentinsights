class TeamMembership < ApplicationRecord
  belongs_to :student

  validates :activity_text, presence: true, exclusion: { in: ['']}
  validates :coach_text, presence: true, exclusion: { in: ['']}
  validates :school_year_text, presence: true, format: {
    with: /\A(20\d\d)-(\d\d)\z/,
    message: 'must be format 2002-03'
  }
  validates :activity_text, presence: true, uniqueness: {
    scope: [:student_id, :school_year_text, :season_key]
  }
  validates :season_key, inclusion: { in: ['fall', 'winter', 'spring'] }

  def active(options = {})
    this_season_key, school_year_text = TeamMembership.this_season_and_year(options)
    self.school_year_text == school_year_text && self.season_key == this_season_key.to_s
  end

  def season_sort_key(options = {})
    school_year = self.school_year_text.split('-').first.to_i
    season_number = ['fall', 'winter', 'spring'].index(self.season_key) || 0
    [school_year, season_number]
  end

  def self.active(options = {})
    this_season_key, school_year_text = self.this_season_and_year(options)
    TeamMembership.where({
      school_year_text: school_year_text,
      season_key: this_season_key
    })
  end

  def self.this_season_and_year(options = {})
    time_now = options.fetch(:time_now, Time.now)
    this_school_year = SchoolYear.to_school_year(time_now)
    short_next_school_year = (this_school_year + 1).to_s.last(2)
    school_year_text = "#{this_school_year}-#{short_next_school_year}"
    this_season_key = PerDistrict.new.sports_season_key(time_now)

    [this_season_key, school_year_text]
  end
end
