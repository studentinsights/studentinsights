class DenormalizeServiceProviderByEducator < ActiveRecord::Migration[4.2]
  def change
    add_column :services, :provided_by_educator_name, :string

    Service.find_each do |service|
      educator_id = service.provided_by_educator_id
      educator = Educator.find(educator_id)
      educator_name = educator.try(:full_name)
      service.provided_by_educator_name = educator_name
      service.save!
    end

    remove_column :services, :provided_by_educator_id
  end
end
