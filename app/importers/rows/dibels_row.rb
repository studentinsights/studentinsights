class DibelsRow < Struct.new :row
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.

  def self.build(row)
    new(row).build
  end

  def build
    student_assessment = StudentAssessment.find_or_initialize_by(
      student: student,
      assessment: assessment,
      date_taken: row[:assessment_date]
    )

    student_assessment.assign_attributes(
      performance_level: row[:assessment_performance_level]
    )

    student_assessment
  end

  private

  def student
    Student.find_by_local_id!(row[:local_id])
  end

  def assessment
    Assessment.find_or_create_by!(family: 'DIBELS')
  end

end
