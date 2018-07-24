class CreateMasqueradingLog < ActiveRecord::Migration[5.1]
  def change
    create_table :masquerading_logs do |t|
      t.integer :educator_id
      t.integer :masquerading_as_educator_id
      t.text :action
      t.timestamps
    end
    add_foreign_key :masquerading_logs, :educators, column: 'educator_id'
    add_foreign_key :masquerading_logs, :educators, column: 'masquerading_as_educator_id'
  end
end
