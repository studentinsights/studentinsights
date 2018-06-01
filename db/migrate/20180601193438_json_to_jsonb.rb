class JsonToJsonb < ActiveRecord::Migration[5.1]
  def change
    change_column :class_lists, :principal_revisions_json, :json
  end
end
