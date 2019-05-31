namespace :searchbar do
  desc 'Update educator student searchbar cached data'
  task update_for_all_educators: :environment do
    Educator.all.each do |educator|
      EducatorSearchbar.update_student_searchbar_json!(educator)
    end
  end

  desc 'Update educator student searchbar data for those who have logged in'
  task update_for_educators_who_log_in: :environment do
    Educator.where("sign_in_count > ?", 0).each do |educator|
      EducatorSearchbar.update_student_searchbar_json!(educator)
    end
  end
end
