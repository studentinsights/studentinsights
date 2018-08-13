# Checks assessments against the validations sketched out in student_assessment.rb.
# Those validations are commented out and not being enforced; this code will
# tell us how many invalid records we have in production in MCAS, STAR, DIBELS.
# First step to implementing and enforcing proper validation.
class StudentAssessmentIntegrityCheck
  def check_mcas
    mcas_assessment_ids = Assessment.where(family: 'MCAS').pluck(:id)
    records = StudentAssessment.where(assessment_id: mcas_assessment_ids)
    total_records = records.count

    scale_score_present = records.where.not(scale_score: nil)
    growth_percentile_present = records.where.not(growth_percentile: nil)
    performance_level_present = records.where.not(performance_level: nil)
    percentile_rank_nil = records.where(percentile_rank: nil)

    puts "MCAS:"
    puts "Total records: #{total_records}"

    puts "scale_score_present: #{scale_score_present.count}/#{total_records}"
    puts "growth_percentile_present: #{growth_percentile_present.count}/#{total_records}"
    puts "performance_level_present: #{performance_level_present.count}/#{total_records}"
    puts "percentile_rank_nil: #{percentile_rank_nil.count}/#{total_records}"
    puts
  end
end
