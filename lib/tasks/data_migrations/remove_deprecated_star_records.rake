namespace :data_migration do
  desc "Remove deprecated STAR records"
  task remove_deprecated_star: :environment do
    puts "Records in student_assessment table: #{StudentAssessment.count}"

    puts "Destorying STAR assessments..."
    Assessment.where(family: 'STAR').delete_all
    puts "Done."

    puts "Records in student_assessment table: #{StudentAssessment.count}"
  end
end
