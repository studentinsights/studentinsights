class MultifactorEmail < ActiveRecord::Migration[6.0]
  def change
    add_column :educator_multifactor_configs, :via_email, :boolean, default: false
  end
end
