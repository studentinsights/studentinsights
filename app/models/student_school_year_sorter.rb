class StudentSchoolYearSorter

  def initialize(student:)
    @student = student
  end

  def sort
    @sorted_school_years ||= events.inject([]) do |memo, event|
      occurred_at = event.occurred_at

      school_year_name = find_school_year_name(occurred_at.month, occurred_at.year)

      school_year_events = memo.detect { |sy| sy.name == school_year_name }

      if school_year_events
        school_year_events.add_event(event)
      else
        memo << StudentSchoolYearEvents.new(
          name: school_year_name, events: [event]
        )
      end

      memo.sort_by { |student_school_year| student_school_year.name }.reverse
    end
  end

  def sort_and_filter(filter_to_date, filter_from_date)
    first_included_school_year_name = find_school_year_name(filter_to_date.month, filter_to_date.year)
    last_included_school_year_name = find_school_year_name(filter_from_date.month, filter_from_date.year)

    sort.select do |school_year|
      # '2014-2015'.to_i => 2014
      school_year.name.to_i >= first_included_school_year_name.to_i &&
        school_year.name.to_i <= last_included_school_year_name.to_i
    end
  end

  private

    def events
      [
        @student.discipline_incidents,
        @student.absences,
        @student.tardies,
      ].flatten
    end

    def find_school_year_name(month, year)
      if month >= 8
        "#{year}-#{year + 1}"
      elsif month >= 1 && month <= 7
        "#{year - 1}-#{year}"
      end
    end

end
