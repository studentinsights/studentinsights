# Checks assessments against the validations sketched out in student_assessment.rb.
# Those validations are commented out and not being enforced; this code will
# tell us how many invalid records we have in production in MCAS, STAR, DIBELS.
# First step to implementing and enforcing proper validation.
class StudentAssessmentIntegrityCheck

  def check_assessments
    check_star
    check_mcas
    check_dibels
  end

  def check_star
    star_assessment_ids = Assessment.where(family: 'STAR').pluck(:id)
    records = StudentAssessment.where(assessment_id: star_assessment_ids)
    total_records = records.count

    percentile_rank_present = records.where.not(percentile_rank: nil)
    grade_equivalent_present = records.where.not(grade_equivalent: nil)
    scale_score_nil = records.where(scale_score: nil)
    growth_percentile_nil = records.where(growth_percentile: nil)
    performance_level_nil = records.where(performance_level: nil)

    puts "STAR:"
    puts "Total records: #{total_records}"

    puts "percentile_rank_present: #{percentile_rank_present.count}/#{total_records}"
    puts "grade_equivalent_present: #{grade_equivalent_present.count}/#{total_records}"
    puts "scale_score_nil: #{scale_score_nil.count}/#{total_records}"
    puts "growth_percentile_nil: #{growth_percentile_nil.count}/#{total_records}"
    puts "performance_level_ni: #{performance_level_nil.count}/#{total_records}"
    puts

    star_reading_id = Assessment.where(subject: 'Reading', family: 'STAR').pluck(:id)
    star_reading_records = StudentAssessment.where(assessment_id: star_reading_id)
    irl_present = star_reading_records.where.not(instructional_reading_level: nil)

    puts "STAR Reading:"
    puts "instructional_reading_level_present: #{irl_present.count}/#{total_records}"
    puts
  end

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

  def check_dibels
    dibels_assessment_ids = Assessment.where(family: 'DIBELS').pluck(:id)
    records = StudentAssessment.where(assessment_id: dibels_assessment_ids)
    total_records = records.count

    performance_level_present = records.where.not(performance_level: nil)
    scale_score_nil = records.where(scale_score: nil)
    percentile_rank_nil = records.where(percentile_rank: nil)
    growth_percentile_nil = records.where(growth_percentile: nil)

    puts "DIBELS:"
    puts "Total records: #{total_records}"

    puts "performance_level_present: #{performance_level_present.count}/#{total_records}"
    puts "scale_score_nil: #{scale_score_nil.count}/#{total_records}"
    puts "percentile_rank_nil: #{percentile_rank_nil.count}/#{total_records}"
    puts "growth_percentile_nil: #{growth_percentile_nil.count}/#{total_records}"
    puts
  end

end
