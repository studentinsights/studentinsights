class AddLoginToEducatorsTable < ActiveRecord::Migration[5.2]
  def change
    add_column :educators, :login_name, :text, null: true

    Educator.all.each do |educator|
      login_name = educator.email.split('@').first
      educator.update!(login_name: login_name)
    end

    change_column :educators, :login_name, :text, null: false
  end
end
