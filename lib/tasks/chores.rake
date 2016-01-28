namespace :chores do
  desc 'Update counter caches for Absence and Tardy'
  task update_absence_and_tardy_counts: :environment do
    Absence.find_each(&:save)
    Tardy.find_each(&:save)
  end
end
