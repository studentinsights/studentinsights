namespace :data_migration do
  desc "Remove deprecated STAR records"
  task remove_deprecated_star: :environment do
    puts "Records in student_assessment table: #{StudentAssessment.count}"

    put "Destorying STAR assessments..."
    Assessment.where(family: 'STAR').destroy_all
    puts "Done."

    puts "Records in student_assessment table: #{StudentAssessment.count}"
  end
end
