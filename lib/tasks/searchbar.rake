namespace :searchbar do
  desc 'Update educator student searchbar cached data'
  task update_for_all_educators: :environment do
    # This is a long-running task, and can take an hour or two to run slowly as an
    # overnight task.

    # First, update this for all active educators.
    puts 'Starting update for active educators...'
    active_educators = Educator.active
    active_educators.each do |educator|
      puts "  updating searchbar for educator.id: #{educator.id}..."
      EducatorSearchbar.update_student_searchbar_json!(educator)
    end
    puts 'Done update.'

    # Then prune any old records, for educators who are no longer active.
    puts 'Pruning old records...'
    records_to_prune = EducatorSearchbar.where.not(educator_id: active_educators.map(&:id))
    puts "  found #{records_to_prune.size} records_to_prune, destroying them..."
    records_to_prune.destroy!
    puts 'Done prune.'
  end
end
