namespace :searchbar do
  desc 'Update educator student searchbar cached data'
  task update_for_all_educators: :environment do
    Educator.save_student_searchbar_json
  end

  desc 'Update educator student searchbar data for those who have logged in'
  task update_for_educators_who_log_in: :environment do
    Educator.save_student_searchbar_json_for_folks_who_log_in
  end
end
