class CreatePasswordChecks < ActiveRecord::Migration[5.2]
  def change
    create_table :password_checks, id: :uuid do |t|
      t.text :json_encrypted
    end
  end
end
