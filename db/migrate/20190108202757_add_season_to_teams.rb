# typed: true
class AddSeasonToTeams < ActiveRecord::Migration[5.2]
  def change
    add_column :team_memberships, :season_key, :text, null: true
  end
end
