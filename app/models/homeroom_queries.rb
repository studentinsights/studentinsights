# This class performs queries for the /schools/:id/classrooms endpoint.
class HomeroomQueries
  def initialize(homerooms)
    @homerooms = homerooms
  end

  def top_absences
    homerooms_with_absences_average.sort do |a, b|
      b[:result_value] <=> a[:result_value]           # Sort descending
    end
  end

  def top_tardies
    homerooms_with_tardies_average.sort do |a, b|
      b[:result_value] <=> a[:result_value]           # Sort descending
    end
  end

  def top_mcas_math_concerns
    homerooms_with_mcas_math_average.sort do |a, b|
      a[:result_value] <=> b[:result_value]
    end
  end

  def top_mcas_ela_concerns
    homerooms_with_mcas_ela_average.sort do |a, b|
      a[:result_value] <=> b[:result_value]
    end
  end

  private

  def homerooms_serialized_with_mcas_math_results
    @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :grade => homeroom.grade,
        :result_value => homeroom.average_mcas_math_score,
        :interventions_count => recent_interventions_for(homeroom.students, math_interventions).length || 0
      }
    end
  end

  def homerooms_serialized_with_mcas_ela_results
    @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :grade => homeroom.grade,
        :result_value => homeroom.average_mcas_ela_score,
        :interventions_count => recent_interventions_for(homeroom.students, math_interventions).length || 0
      }
    end
  end

  def homerooms_serialized_with_absences_results
    @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :grade => homeroom.grade,
        :result_value => homeroom.average_absences_most_recent_school_year,
        :interventions_count => recent_interventions_for(homeroom.students, attendance_interventions).length || 0
      }
    end
  end

  def homerooms_serialized_with_tardies_results
    @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :grade => homeroom.grade,
        :result_value => homeroom.average_tardies_most_recent_school_year,
        :interventions_count => recent_interventions_for(homeroom.students, attendance_interventions).length || 0
      }
    end
  end

  def homerooms_with_mcas_math_average
    homerooms_serialized_with_mcas_math_results.delete_if do |homeroom|
      homeroom[:result_value] == nil
    end
  end

  def homerooms_with_mcas_ela_average
    homerooms_serialized_with_mcas_ela_results.delete_if do |homeroom|
      homeroom[:result_value] == nil
    end
  end

  def homerooms_with_absences_average
    homerooms_serialized_with_absences_results.delete_if do |homeroom|
      homeroom[:result_value] == nil
    end
  end

  def homerooms_with_tardies_average
    homerooms_serialized_with_tardies_results.delete_if do |homeroom|
      homeroom[:result_value] == nil
    end
  end

  def math_interventions
    generic_interventions + InterventionType.where(name: [
      'After-School Tutoring (ATP)',
      'Classroom Academic Intervention',
      'Math Tutor'
    ])
  end

  def attendance_interventions
    generic_interventions + InterventionType.where(name: [
      'Attendance Officer',
      'Attendance Contract'
    ])
  end

  def generic_interventions
    InterventionType.where(name: [
      'MTSS Referral',
      'Other',
      'SST Referral',
      '51a Filing'
    ])
  end

  def recent_interventions_for(students, interventions)
    intervention_ids = interventions.map(&:id)
    all_interventions = students.map do |student|
      student.most_recent_school_year.try(:interventions)
    end.flatten.compact
    all_interventions.select {|it| intervention_ids.include?(it.id) }
  end
end
