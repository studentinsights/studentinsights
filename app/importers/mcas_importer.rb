class McasImporter
  include X2Importer

  def export_file_name
    'assessment_export.txt'
  end

  def import_row(row)
    if row[:assessment_test] == 'MCAS'
      student = Student.where(state_id: row[:state_id]).first_or_create!
      mcas_result = McasResult.where(
        student_id: student.id,
        date_taken: row[:assessment_date],
      ).first_or_create!

      if !/\D/.match(row[:assessment_growth]).nil?    # If column contains non-numerical characters,
        row[:assessment_growth] = nil                 # set to nil beacuse it's one of the non-growth-related
      end                                             # string/date values floating around this column

      case row[:assessment_subject]
      when "Math"
        mcas_result.update_attributes(
          math_scaled: row[:assessment_scale_score],
          math_performance: row[:assessment_performance_level],
          math_growth: row[:assessment_growth]
        )
      when "ELA"
        mcas_result.update_attributes(
          ela_scaled: row[:assessment_scale_score],
          ela_performance: row[:assessment_performance_level],
          ela_growth: row[:assessment_growth]
        )
      end
    end
  end
end
