class RelaxSmsNumber < ActiveRecord::Migration[5.2]
  def change
    change_column :educator_multifactor_text_numbers, :sms_number, :string, null: true
  end
end
