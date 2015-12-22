# This class performs queries for the /schools/:id/classrooms endpoint.
class HomeroomQueries
  def initialize(homerooms)
    @homerooms = homerooms
  end

  def top_absences
    @homerooms.map {|homeroom| attendance_response(homeroom, :absences_count_most_recent_school_year) }
  end

  def top_tardies
    @homerooms.map {|homeroom| attendance_response(homeroom, :tardies_count_most_recent_school_year) }
  end

  def top_mcas_math_concerns
    serialized_homerooms = @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :result_value => homeroom.average_mcas_math_score,
        :interventions_count => recent_interventions_for(homeroom.students, math_interventions).length || 0
      }
    end
    serialized_homerooms.delete_if do |homeroom|
      # Remove homerooms whose students have no MCAS Math assessment results
      homeroom[:result_value] == nil
    end
    serialized_homerooms.sort {|a, b| a[:result_value] <=> b[:result_value] }
  end

  def top_mcas_ela_concerns
    serialized_homerooms = @homerooms.map do |homeroom|
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :result_value => homeroom.average_mcas_ela_score,
        :interventions_count => recent_interventions_for(homeroom.students, math_interventions).length || 0
      }
    end
    serialized_homerooms.delete_if do |homeroom|
      # Remove homerooms whose students have no MCAS ELA assessment results
      homeroom[:result_value] == nil
    end
    serialized_homerooms.sort {|a, b| a[:result_value] <=> b[:result_value] }
  end

  private

  def attendance_response(homeroom, method_name)
    {
      :id => homeroom.id,
      :name => homeroom.name,
      :result_value => homeroom.students.map {|student| student.send(method_name) }.compact.reduce(:+),
      :interventions_count => recent_interventions_for(homeroom.students, attendance_interventions).length || 0
    }
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
