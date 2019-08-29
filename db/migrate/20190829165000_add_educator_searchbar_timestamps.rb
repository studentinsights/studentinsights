class AddEducatorSearchbarTimestamps < ActiveRecord::Migration[5.2]
  def change
    time_now = Time.now
    puts 'Starting!  Migration time: #{time_now}'

    puts 'Adding columns...'
    add_column :educator_searchbars, :created_at, :datetime, null: true
    add_column :educator_searchbars, :updated_at, :datetime, null: true

    puts 'Setting timestamp values...'
    EducatorSearchbar.all.each do |educator_searchbar|
      educator_searchbar.update!({
        created_at: time_now,
        updated_at: time_now
      })
    end

    puts 'Migrating to non-null...'
    change_column :educator_searchbars, :created_at, :datetime, null: false
    change_column :educator_searchbars, :updated_at, :datetime, null: false
    puts 'Done.'
  end
end
