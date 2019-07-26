# typed: true
class RenameMultifactorTable < ActiveRecord::Migration[5.2]
  def change
    rename_table :educator_multifactor_text_numbers, :educator_multifactor_configs
  end
end
