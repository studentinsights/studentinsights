# typed: false
class AddServiceTypeForAfterschoolTutoring < ActiveRecord::Migration[4.2]
  def change
    if ServiceType.find_by_id(511).nil?
      ServiceType.create({ id: 511, name: 'Afterschool Tutoring' })
    end
  end
end
