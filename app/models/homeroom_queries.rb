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

  def top_mcas_ela_concerns
    mcas_concerns(:most_recent_mcas_math_scaled)
  end

  def top_mcas_math_concerns
    mcas_concerns(:most_recent_mcas_ela_scaled)
  end

  private
  def mcas_concerns(method_name)
    homeroom_rows = @homerooms.map do |homeroom|
      # guard for missing mcas scores
      values = homeroom.students.map {|student| student.send(method_name) }.compact
      result_value = if values.size == 0 then nil else (values.reduce(:+).to_f / values.size).round(0) end
      {
        :id => homeroom.id,
        :name => homeroom.name,
        :result_value => result_value,
        :interventions_count => recent_interventions_for(homeroom.students, math_interventions).length || 0
      }
    end
    homeroom_rows.sort {|a, b| a[:result_value] <=> b[:result_value] } 
  end

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