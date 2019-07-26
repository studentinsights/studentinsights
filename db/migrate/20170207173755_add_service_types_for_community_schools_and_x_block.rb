# typed: false
class AddServiceTypesForCommunitySchoolsAndXBlock < ActiveRecord::Migration[4.2]
  def change
    if ServiceType.find_by_id(513).nil?
      ServiceType.create({ id: 513, name: 'Community Schools' })
    end

    if ServiceType.find_by_id(514).nil?
      ServiceType.create({ id: 514, name: 'X-Block' })
    end
  end
end
