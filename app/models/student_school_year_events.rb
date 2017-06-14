class StudentSchoolYearEvents

  def initialize(name:, events:)
    @name = name
    @events = events
  end

  def name
    @name
  end

  def add_event(event)
    @events << event
  end

  def absences
    @events.select  { |e| e.class == Absence }
           .sort_by { |e| e.occurred_at }
           .reverse
  end

  def tardies
    @events.select { |e| e.class == Tardy }
           .sort_by { |e| e.occurred_at }
           .reverse
  end

  def discipline_incidents
    @events.select  { |e| e.class == DisciplineIncident }
           .sort_by { |e| e.occurred_at }
           .reverse
  end

end
