class Feed
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  # Return a list of `FeedCard`s for the feed based on event notes.
  def event_note_cards(from_time, limit)
    # This is a performance optimization - we check the authorization
    # of one at a time, so that we can exit early
    recent_event_notes = unsafe_authorization! do
      unsafe_event_notes = EventNote
        .includes(:student)
        .where(is_restricted: false)
        .where('recorded_at < ?', from_time)
        .order(recorded_at: :desc)

      authorized_event_notes = []
      unsafe_event_notes.each do |unsafe_event_note|
        if @authorizer.is_authorized_for_note?(unsafe_event_note)
          authorized_event_notes << unsafe_event_note
        end
        break if authorized_event_notes.size >= limit
      end
      authorized_event_notes
    end

    recent_event_notes.map {|event_note| event_note_card(event_note) }
  end

  # This looks both ahead and behind for birthdays.
  # If there are many, don't return any so as not to
  # overwhelm (eg, for dept. heads).
  def birthday_cards(time_now, limit, options = {})
    limit = options[:limit] || 3
    days_back = options[:days_back] || 7
    days_ahead = options[:days_ahead] || 7
    students = @authorizer.authorized do
      Student.select(:id, :primary_email, :first_name, :last_name, :date_of_birth)
        .where('extract(doy from date_of_birth) > ?', time_now.yday - days_back)
        .where('extract(doy from date_of_birth) <= ?', time_now.yday + days_ahead)
        .order('extract(doy from date_of_birth) DESC')
        .limit(limit)
    end
    students.map { |student| birthday_card(student, time_now) }
  end

  # Returns recent discipline incidents.
  def incident_cards(time_now, limit)
    students = @authorizer.authorized { Student.all }
    incidents = DisciplineIncident
      .where(student_id: students.map(&:id))
      .where('occurred_at < ?', time_now)
      .order(occurred_at: :desc)
      .limit(limit)
    incidents.map {|incident| incident_card(incident) }
  end

  # Merge cards of different types together, sorted by most recent timestamp
  # first, and then truncate them to `limit`.
  def merge_sort_and_limit_cards(card_sets, limit)
    card_sets.flatten.sort_by {|card| card.timestamp.to_i * -1 }.first(limit)
  end

  private
  # This is just to tag a block as unsafe in terms of authorization
  def unsafe_authorization!
    yield
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
