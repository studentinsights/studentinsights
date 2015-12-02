class StudentSchoolYear < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
  has_many :attendance_events
  has_many :student_assessments
  has_many :discipline_incidents
  has_many :interventions
  delegate :name, to: :school_year

  def mcas_math_result
    student_assessments.latest
                       .by_family_and_subject("MCAS", "Math")
                       .first_or_missing
  end

  def mcas_ela_result
    student_assessments.latest
                       .by_family_and_subject("MCAS", "ELA")
                       .first_or_missing
  end

  def star
    student_assessments.by_family("STAR")
                       .group_by { |result| result.date_taken }
  end

  def dibels
    student_assessments.by_family("DIBELS")
                       .order_or_missing
  end

  def access
    student_assessments.latest
                       .by_family("ACCESS").first_or_missing
  end

  def attendance_events_summary
    {
      tardies: attendance_events.where(tardy: true).size,
      absences: attendance_events.where(absence: true).size
    }
  end

end
