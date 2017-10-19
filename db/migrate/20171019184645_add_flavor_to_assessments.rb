class AddFlavorToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :flavor, :string, null: false, default: 'Regular'
  end
end
