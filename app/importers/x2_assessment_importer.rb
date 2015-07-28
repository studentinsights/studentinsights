class X2AssessmentImporter
  include X2Importer

  def export_file_name
    'assessment_export.txt'
  end

  def import_row(row)
    student = Student.where(state_id: row[:state_id]).first_or_create!
    subject = AssessmentSubject.where(name: row[:assessment_subject]).first_or_create!
    family = AssessmentFamily.where(name: row[:assessment_test]).first_or_create!

    result = Assessment.where(
      student_id: student.id,
      date_taken: row[:assessment_date],
      assessment_subject_id: subject.id,
      assessment_family_id: family.id
    ).first_or_create!

    if !/\D/.match(row[:assessment_growth]).nil?    # If column contains non-numerical characters,
      row[:assessment_growth] = nil                 # set to nil beacuse it's one of the non-growth-related
    end                                             # string/date values floating around this column

    result.update_attributes(
      scale_score: row[:assessment_scale_score],
      performance_level: row[:assessment_performance_level],
      growth_percentile: row[:assessment_growth]
    )
  end
end
