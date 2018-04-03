class Feed
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  # Return a list of `FeedCard`s for the feed based on event notes.
  def event_note_cards(from_time, limit)
    recent_event_notes = EventNote
      .where(student_id: authorized_students.map(&:id))
      .where(is_restricted: false)
      .where('recorded_at < ?', from_time)
      .order(recorded_at: :desc)
      .limit(limit)
      .includes(student: :homeroom)
    recent_event_notes.map {|event_note| event_note_card(event_note) }
  end

  # This looks both ahead and behind for birthdays.
  # If there are many, don't return any so as not to
  # overwhelm (eg, for dept. heads).
  def birthday_cards(time_now, limit, options = {})
    limit = options[:limit] || 3
    days_back = options[:days_back] || 7
    days_ahead = options[:days_ahead] || 7
    students = Student
      .where(id: authorized_students.map(&:id))
      .where('extract(doy from date_of_birth) > ?', time_now.yday - days_back)
      .where('extract(doy from date_of_birth) <= ?', time_now.yday + days_ahead)
      .order('extract(doy from date_of_birth) DESC')
      .limit(limit)
    students.map { |student| birthday_card(student, time_now) }
  end

  # Returns recent discipline incidents.
  def incident_cards(time_now, limit)
    incidents = DisciplineIncident
      .where(student_id: authorized_students.map(&:id))
      .where('occurred_at < ?', time_now)
      .order(occurred_at: :desc)
      .limit(limit)
      .includes(student: :homeroom)
    incidents.map {|incident| incident_card(incident) }
  end

  # Merge cards of different types together, sorted by most recent timestamp
  # first, and then truncate them to `limit`.
  def merge_sort_and_limit_cards(card_sets, limit)
    card_sets.flatten.sort_by {|card| card.timestamp.to_i * -1 }.first(limit)
  end

  private
  # Performance optimization to cache across methods
  def authorized_students
    @authorized_students ||= @authorizer.authorized { Student.all }
  end

  # Create json for exactly what UI needs and return as `FeedCard`
  def event_note_card(event_note)
    json = event_note.as_json({
      :only => [:id, :recorded_at, :event_note_type_id, :text],
      :include => {
        :educator => {:only => [:id, :full_name, :email]},
        :student => {
          :only => [:id, :email, :first_name, :last_name, :grade, :house],
          :include => {
            :homeroom => {
              :only => [:id, :name],
              :include => {
                :educator => {:only => [:id, :full_name, :email]}
              }
            }
          }
        }
      }
    })
    FeedCard.new(:event_note_card, event_note.recorded_at, json)
  end

  def birthday_card(student, time_now)
    json = student.as_json({
      :only => [:id, :email, :first_name, :last_name, :date_of_birth]
    })
    timestamp = student.date_of_birth.change(year: time_now.year)
    FeedCard.new(:birthday_card, timestamp, json)
  end

  def incident_card(incident)
    json = incident.as_json({
      :only => [:id, :incident_code, :incident_location, :incident_description, :occurred_at, :has_exact_time],
      :include => {
        :student => {
          :only => [:id, :email, :first_name, :last_name, :grade, :house],
          :include => {
            :homeroom => {
              :only => [:id, :name],
              :include => {
                :educator => {:only => [:id, :full_name, :email]}
              }
            }
          }
        }
      }
    })
    FeedCard.new(:incident_card, incident.occurred_at, json)
  end
end
