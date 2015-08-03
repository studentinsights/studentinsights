class X2AssessmentImporter
  include Importer

  def remote_file_name
    'assessment_export.txt'
  end

  def assessment_white_list
    ["ACCESS", "WIDA-ACCESS", "DIBELS", "MCAS", "MAP", "MELA-O", "MEPA", "STAR"]
  end

  def check_white_list(row)
    assessment_white_list.include? row[:assessment_test]
  end

  def import_row(row)
    return unless check_white_list(row)
    standardize_access_test_names(row)
    chuck_non_numerical_growth_scores(row)

    student = Student.where(local_id: row[:local_id]).first_or_create!
    subject = AssessmentSubject.where(name: row[:assessment_subject]).first_or_create!
    family = AssessmentFamily.where(name: row[:assessment_test]).first_or_create!

    result = Assessment.where(
      student_id: student.id,
      date_taken: row[:assessment_date],
      assessment_subject_id: subject.id,
      assessment_family_id: family.id
    ).first_or_create!

    result.update_attributes(
      scale_score: row[:assessment_scale_score],
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )
  end

  def standardize_access_test_names(row)
    if row[:assessment_test] == "WIDA-ACCESS"
      row[:assessment_test] = "ACCESS"
    end
  end

  def chuck_non_numerical_growth_scores(row)
    if !/\D/.match(row[:assessment_growth]).nil?
      row[:assessment_growth] = nil
    end
  end
end
