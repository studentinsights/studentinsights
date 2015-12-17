namespace :update do
  desc "Updates student risk levels."
  task risk_levels: :environment do
    Student.update_risk_levels
  end

  desc "Updates student school years."
  task student_school_years: :environment do
    Student.update_student_school_years
  end

  desc "Updates student attendance event counts."
  task attendance_events: :environment do
    Student.update_attendance_events_counts_most_recent_school_year
  end

  desc "Updates recent student assessment results."
  task recent_assessments: :environment do
    Student.update_recent_student_assessments
  end

end
