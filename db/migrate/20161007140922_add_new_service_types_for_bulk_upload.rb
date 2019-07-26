# typed: true
class AddNewServiceTypesForBulkUpload < ActiveRecord::Migration[4.2]
  def change
    if ServiceType.find_by_id(509).nil?
      ServiceType.create({ id: 509, name: 'SomerSession' })
    end

    if ServiceType.find_by_id(510).nil?
      ServiceType.create({ id: 510, name: 'Summer Program for English Language Learners' })
    end
  end
end
