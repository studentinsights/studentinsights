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
end
