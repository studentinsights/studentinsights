class Feed
  # What students should be shown in an educator's feed?
  # This isn't always exactly the same as "who is this educator authorized
  # to view?"
  def self.students_for_feed(educator)
    # Start with all students they are authorized to view
    authorizer = Authorizer.new(educator)
    authorized_students = authorizer.authorized do
      Student.active.select(:counselor, :house) # these are fetching for FeedFilter below
    end

    # Filter by role (eg, for HS counselors caseload)
    FeedFilter.new(educator).filter_for_educator(authorized_students)
  end

  def initialize(authorized_students)
    @authorized_students = authorized_students
  end

  # Return everything, with all the default options.
  #
  # Query for different kinds of feed cards, then merge and sort and truncate.
  # This means we'll always slightly overquery, since we don't know how many
  # different bits of information there are across data sources until
  # we query and combine them. Ideally we'd query in parallel but we'd
  # need to push this out to the client to do that (and still would have to
  # delay rendering until both came back and were merged anyway).
  def all_cards(time_now, limit)
    event_note_cards = self.event_note_cards(time_now, limit)
    birthday_cards = self.birthday_cards(time_now, limit, {
      limit: 3,
      days_back: 3,
      days_ahead: 0
    })
    incident_cards = if PerDistrict.new.include_incident_cards?
      self.incident_cards(time_now, limit)
    else
      []
    end
    self.merge_sort_and_limit_cards([
      event_note_cards,
      birthday_cards,
      incident_cards
    ], limit)
  end

  # Return a list of `FeedCard`s for the feed based on event notes.
  def event_note_cards(from_time, limit)
    recent_event_notes = EventNote
      .where(student_id: @authorized_students.map(&:id))
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
      .where(id: @authorized_students.map(&:id))
      .where('extract(doy from date_of_birth) > ?', time_now.yday - days_back)
      .where('extract(doy from date_of_birth) <= ?', time_now.yday + days_ahead)
      .order(Arel.sql('extract(doy from date_of_birth) DESC')) # see https://github.com/rails/rails/issues/32995
      .limit(limit)
    students.map { |student| birthday_card(student, time_now) }
  end

  # Returns recent discipline incidents.
  def incident_cards(time_now, limit)
    incidents = DisciplineIncident
      .where(student_id: @authorized_students.map(&:id))
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
