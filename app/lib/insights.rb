class Insights
  def initialize(educator)
    @educator = educator
  end

  def boxes
    if @educator.school.present? && @educator.school.is_high_school?
      [:absences, :low_grades]
    else
      [:absences]
    end
  end
end
