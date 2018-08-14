namespace :data_migration do
  desc "Remove deprecated STAR records"
  task remove_deprecated_star: :environment do
    puts "Records in student_assessment table: #{StudentAssessment.count}"

    puts "Deleting STAR StudentAssessments..."

    star_assessment_ids = Assessment.where(family: 'STAR')
    StudentAssessment.where(assessment_id: star_assessment_ids).delete_all
    puts "Records in student_assessment table: #{StudentAssessment.count}"

    puts "Destorying deprecated STAR Assessment records:"
    Assessment.where(id: star_assessment_ids).destroy_all

    puts "Done."
  end
end
