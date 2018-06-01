class JsonToJsonb < ActiveRecord::Migration[5.1]
  def change
    change_column :class_lists, :json, :jsonb
    change_column :class_lists, :principal_revisions_json, :jsonb
  end
end
