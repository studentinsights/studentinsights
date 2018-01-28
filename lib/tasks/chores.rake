namespace :chores do
  desc 'Update counter caches for Absence and Tardy'
  task update_absence_and_tardy_counts: :environment do
    Absence.find_each(&:save)
    Tardy.find_each(&:save)
  end

  desc 'Update counter caches for DisciplineIncident'
  task update_discipline_incident_counts: :environment do
    DisciplineIncident.find_each(&:save)
  end

  desc 'Update student risk levels'
  task update_student_risk_levels: :environment do
    StudentRiskLevel.find_each(&:update_risk_level!)
  end

  desc 'Update educator student searchbar cached data'
  task update_searchbar_data_for_all_educators: :environment do
    Educator.save_student_searchbar_json
  end

  desc 'Update educator student searchbar data for those who have logged in'
  task update_searchbar_data_for_educators_who_log_in: :environment do
    Educator.save_student_searchbar_json_for_folks_who_log_in
  end

  desc 'Kick off background worker for data import'
  task import_data_in_background: :environment do
    Delayed::Job.enqueue ImportJob.new
  end

  desc 'Kick off console output for fun'
  task console_output_in_background: :environment do
    Delayed::Job.enqueue ConsoleJob.new
  end
end
