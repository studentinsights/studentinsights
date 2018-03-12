class MigrateNextGenMcas < ActiveRecord::Migration[5.1]
  def change
    return if Assessment.find_by(family: 'Next Gen MCAS')

    puts "⚙  ⚙  ⚙  Making new assessment models for Next Gen..."; puts;

    Assessment.create!(family: 'Next Gen MCAS', subject: 'Mathematics')

    Assessment.create!(family: 'Next Gen MCAS', subject: 'ELA')

    return if StudentAssessment.count == 0  # Nothing to migrate here!

    puts "⚙  ⚙  ⚙  Looking up old assessment models for MCAS..."; puts;

    mcas_math = Assessment.find_by(family: 'MCAS', subject: 'Mathematics')

    mcas_ela = Assessment.find_by(family: 'MCAS', subject: 'ELA')

    [mcas_math, mcas_ela].each do |assessment|
      subject = assessment.subject
      new_assessment_id = Assessment.find_by(family: 'Next Gen MCAS', subject: subject).id

      puts "Detecting and migrating Next Gen MCAS for #{subject}..."; puts;

      student_assessments = assessment.student_assessments

      puts "Found #{student_assessments.size} student assessments..."; puts;

      student_assessments.map do |student_assessment|
        if student_assessment.scale_score && student_assessment.scale_score > 399
          student_assessment.assessment_id = new_assessment_id
          student_assessment.save
        end
      end

      migrated_student_assessments = StudentAssessment.where(assessment_id: new_assessment_id)

      puts "Migrated #{migrated_student_assessments.size} student assessments..."; puts;
    end
  end
end
