class AddSummerBooleanToServiceType < ActiveRecord::Migration[4.2]
  def change
    add_column :service_types, :summer_program, :boolean, default: false

    ServiceType.reset_column_information

    if ServiceType.find_by_id(512).nil?
      ServiceType.create({ id: 512, name: 'Freedom School', summer_program: true })
    end

    if !(ServiceType.find_by_id(509).nil?)
      summer_school = ServiceType.find_by_id(509)
      summer_school.update!({ summer_program: true })
    end

    if !(ServiceType.find_by_id(510).nil?)
      spell_summer_school = ServiceType.find_by_id(510)
      spell_summer_school.update!({ summer_program: true })
    end
  end
end
