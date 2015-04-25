class BlowAwayAssessments < ActiveRecord::Migration
  def change
    drop_table :assessments
  end
end
