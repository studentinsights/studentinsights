namespace :data_migration do
  desc "Remove deprecated DIBELS records"
  task remove_deprecated_dibels: :environment do
    puts "Records in StudentAssessment table: #{StudentAssessment.count}"

    puts "Deleting DIBELS StudentAssessments..."

    dibels_assessment_id = Assessment.where(family: 'DIBELS')
    StudentAssessment.where(assessment_id: dibels_assessment_id).delete_all
    puts "Records in StudentAssessment table: #{StudentAssessment.count}"

    puts "Destorying deprecated DIBELS Assessment record:"
    Assessment.where(id: dibels_assessment_id).destroy_all

    puts "Done."
  end
end
