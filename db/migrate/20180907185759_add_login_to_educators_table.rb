class AddLoginToEducatorsTable < ActiveRecord::Migration[5.2]
  def change
    add_column :educators, :login_name, :string

    if PerDistrict.new.login_educator_with_email? && Rails.env.production?
      puts "Backfilling login_name column with emails for #{PerDistrict.new.district_key}!"

      Educator.find_each do |educator, index|
        educator.login_name = educator.email
        educator.save!

        puts("  Updated #{index} educators.") if index > 0 && index % 100 == 0
      end

      puts "Done."
    end

    change_column :educators, :login_name, :string, null: false
  end
end
