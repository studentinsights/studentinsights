class McasQueries < Struct.new :school

  def top_5_math_concerns_serialized
    top_5_math_concerns.map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        result_value: student.most_recent_mcas_math_scaled,
        interventions_count: student.most_recent_school_year.interventions.count,
        id: student.id
      }
    end
  end

  def top_5_ela_concerns_serialized
    top_5_ela_concerns.map do |student|
      {
        name: StudentPresenter.new(student).full_name,
        result_value: student.most_recent_mcas_ela_scaled,
        interventions_count: student.most_recent_school_year.interventions.count,
        id: student.id
      }
    end
  end

  private

  def top_5_math_concerns
    school.students.order(most_recent_mcas_math_scaled: :asc).limit(5)
  end

  def top_5_ela_concerns
    school.students.order(most_recent_mcas_ela_scaled: :asc).limit(5)
  end

end
