class AddServiceTypeForAfterschoolTutoring < ActiveRecord::Migration
  def change
    if ServiceType.find_by_id(511).nil?
      ServiceType.create({ id: 511, name: 'Afterschool Tutoring' })
    end
  end
end
