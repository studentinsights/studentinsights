class UseDatabaseLevelDestroyCascadesForEvents < ActiveRecord::Migration[5.1]
  def change
    district_name = ENV['DISTRICT_NAME']

    if district_name == 'Somerville'
      # Delete all absences, tardies, and discipline incidents in Somerville, since removing the foreign keys makes them essentially dead records

      Absences.destroy_all
      DisciplineIncidents.destroy_all
      Tardies.destroy_all
    end

    remove_foreign_key :absences, :students
    remove_foreign_key :discipline_incidents, :students
    remove_foreign_key :tardies, :students

    add_foreign_key :absences, :students, on_delete: :cascade
    add_foreign_key :discipline_incidents, :students, on_delete: :cascade
    add_foreign_key :tardies, :students, on_delete: :cascade

    if district_name == 'Somerville'
      # Start new import job for Somerville since we've deleted all the events

      Delayed::Job.enqueue ImportJob.new
    end
  end
end
