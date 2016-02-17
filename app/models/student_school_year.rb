class StudentSchoolYear < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
  has_many :absences
  has_many :tardies
  has_many :student_assessments
  has_many :discipline_incidents
  has_many :interventions
  delegate :name, to: :school_year
  default_scope { joins(:school_year).order('school_years.start DESC') }

  def mcas_mathematics_result
    student_assessments.order_by_date_taken_asc
                       .by_family_and_subject("MCAS", "Mathematics")
                       .last
  end

  def mcas_ela_result
    student_assessments.order_by_date_taken_asc
                       .by_family_and_subject("MCAS", "ELA")
                       .last
  end

  def star
    student_assessments.by_family("STAR")
                       .group_by { |result| result.date_taken }
  end

  def dibels
    student_assessments.by_family("DIBELS")
                       .order_by_date_taken_desc
  end

  def access
    student_assessments.order_by_date_taken_asc
                       .by_family("ACCESS")
                       .last
  end
end
