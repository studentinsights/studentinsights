namespace :update do
  desc "Updates student risk levels"
  task risk_levels: :environment do
    Student.update_risk_levels
  end

  desc "Updates students' school years"
  task student_school_years: :environment do
    Student.update_student_school_years
  end
end
