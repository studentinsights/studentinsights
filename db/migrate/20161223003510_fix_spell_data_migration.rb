class FixSpellDataMigration < ActiveRecord::Migration
  def change

    if !(ServiceType.find_by_id(510).nil?)
      spell_summer_school = ServiceType.find_by_id(510)
      spell_summer_school.update!({ summer_program: true })
    end

  end
end
