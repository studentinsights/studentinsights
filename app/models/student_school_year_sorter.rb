class StudentSchoolYearSorter

  def initialize(student:)
    @student = student
  end

  def sort
    events.inject([]) do |memo, event|
      school_year_name = find_school_year_name(event)

      school_year_events = memo.detect { |sy| sy.name == school_year_name }

      if school_year_events
        school_year_events.add_event(event)
      else
        memo << StudentSchoolYearEvents.new(
          name: school_year_name, events: [event]
        )
      end

      memo
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

    def find_school_year_name(event)
      occurred_at = event.occurred_at
      month = occurred_at.month
      year = occurred_at.year

      if month >= 8
        "#{year}-#{year + 1}"
      elsif month >= 1 && month <= 7
        "#{year - 1}-#{year}"
      end
    end

end
