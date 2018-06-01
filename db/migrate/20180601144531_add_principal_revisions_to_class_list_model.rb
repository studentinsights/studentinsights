class AddPrincipalRevisionsToClassListModel < ActiveRecord::Migration[5.1]
  def change
    add_column :class_lists, :principal_revisions_json, :json
  end
end
