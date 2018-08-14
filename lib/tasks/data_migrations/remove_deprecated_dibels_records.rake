namespace :data_migration do
  desc "Remove deprecated DIBELS records"
  task remove_deprecated_dibels: :environment do
    puts "Records in student_assessment table: #{StudentAssessment.count}"

    puts "Destorying DIBELS assessments..."
    Assessment.where(family: 'DIBELS').delete_all
    puts "Done."

    puts "Records in student_assessment table: #{StudentAssessment.count}"
  end
end
