desc "Connect to mysql db and assign homerooms to students"

task :import_homerooms => :environment do

  # Get student table from x2
  ActiveRecord::Base.establish_connection(:x2_database_development)
  @sql = "SELECT * from student"
  @result = ActiveRecord::Base.connection.exec_query(@sql).to_hash

  # Switch connection over to main psql db to update students table
  ActiveRecord::Base.establish_connection(:development)
  @assigned = 0
  @unassigned = 0

  @result.each do |row|
    state_id = row["STD_ID_STATE"]
    room_name = row["STD_HOMEROOM"]
    s = Student.find_by_state_identifier(state_id)
    if s.present? && room_name.present? && state_id.present?
      r = Room.where(name: room_name).first_or_create!
      s.room_id = r.id
      if s.save
        @assigned += 1
      else
        @unassigned += 1
      end
    else
      @unassigned += 1
    end
  end

  ActiveRecord::Base.connection.close
  puts "#{@assigned} students assigned."
  puts "#{@unassigned} students not assigned."
  puts "#{Room.all.size} total homerooms."
end