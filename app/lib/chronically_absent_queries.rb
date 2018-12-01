class ChronicallyAbsentQueries
  def initialize(educator, school, options = {})
    @educator = educator
    @authorizer = Authorizer.new(educator)
    @school = school
    @end_time = options.fetch(:end_time, Time.now)
    @start_time = options.fetch(:start_time, SchoolYear.first_day_of_school_for_time(options.fetch(:start_time, @end_time)))

    @cached_school_dates = nil
  end

  def json
    students = authorized_students_for_dashboard(@school) do |students_relation|
      students_relation.includes([homeroom: :educator])
    end

    student_ids = students.map(&:id)
    absences = Absence
      .where(student_id: student_ids)
      .where('occurred_at >= ?', @start_time)
      .where('occurred_at <= ?', @end_time)

    latest_event_notes = EventNote
      .where(student_id: student_ids)
      .where('recorded_at >= ?', @start_time)
      .where('recorded_at <= ?', @end_time)

    all_absences_json = absences.as_json(only: [
      :student_id,
      :occurred_at,
      :excused,
      :dismissed
    ])
    all_event_notes_json = latest_event_notes.as_json(only: [
      :student_id,
      :event_note_type_id,
      :recorded_at
    ])
    students_json = students.as_json(only: [
      :first_name,
      :last_name,
      :grade,
      :house,
      :counselor,
      :id
    ])

    # merge
    absences_json_by_student_id = all_absences_json.group_by {|json| json['student_id'] }
    latest_event_notes_json_by_student_id = all_event_notes_json.group_by {|json| json['student_id'] }
    students_with_events = students_json.map do |student_json|
      student_id = student_json['id']
      student = students.find {|s| s.id == student_id }
      absences = absences_json_by_student_id[student_id] || []
      student_json.merge({
        homeroom_label: homeroom_label(student.homeroom),
        latest_note: latest_event_notes_json_by_student_id[student_id].try(:last),
        absences_count: absences.size,
        rate: compute_attendance_rate(absences, inferred_school_dates),
        absences: absences
      })
    end
    return_json(students_with_events, @school)
  end

  private
  # Infer that there is school if any student in the school was absent on
  # that day.  The idea is that it's unlikely there will be 100% attendance
  # days, and that if no students are absent, it was unlikely to be a school day.
  #
  # This is done per-school since some districts have different calendars
  # at different schools.  Another wrinkle is that attendance is often
  # taken during summer school, so if this is used naively over a wide
  # range it's possible it's including a different type of attendance
  # data than intended.
  def inferred_school_dates
    return @cached_school_dates unless @cached_school_dates.nil?

    @cached_school_dates = Absence
      .joins(:student)
      .where('students.school_id = ?', @school.id)
      .where('occurred_at >= ?', @start_time)
      .where('occurred_at <= ?', @end_time)
      .pluck(:occurred_at)
      .map {|date| date.strftime('%Y%m%d') }
      .uniq
      .sort

    @cached_school_dates
  end

  def compute_attendance_rate(absences_json, school_dates)
    absence_dates = absences_json.map {|a| a['occurred_at'] }.uniq
    ((school_dates.size - absence_dates.size) / school_dates.size.to_f)
  end

  # Modified
  def return_json(students_with_events, school)
    {
      inferred_school_dates: inferred_school_dates,
      students_with_events: students_with_events,
      school: school.as_json(only: [
        :id,
        :local_id,
        :name,
        :slug,
        :school_type
      ])
    }
  end

  # unchanged

  # Filter to match the students in their feed as well (eg, HS counselors
  # see just their caseload).
  def authorized_students_for_dashboard(school, &block)
    @authorizer.authorized do
      students_with_includes = block.call(school.students.active)
      FeedFilter.new(@educator).filter_for_educator(students_with_includes).to_a # workaround for AuthorizeDispatcher#filter_relation
    end
  end

  def homeroom_label(homeroom)
    homeroom.try(:educator).try(:full_name) || homeroom.try(:name) || "No Homeroom"
  end

# def main(educator)
#   start_school_year = SchoolYear.to_school_year(Time.now)
#   # periods = (0..3).map do |i|
#   #   [
#   #     SchoolYear.first_day_of_school_for_year(start_school_year - i),
#   #     SchoolYear.last_day_of_school_for_year(start_school_year - i)
#   #   ]
#   # end.reverse
#   periods = [[nil, nil]]
#   periods.each do |period|
#     go(educator, period)
#   end
# end

# def go(educator, period)
#   # puts "period: #{period}"
#   cutoff_time, end_time = period

#   records = []
#   schools = School.all.sort_by {|s| -1 * s.students.active.size }
#   schools.each do |school|
#     chronic = ChronicAbsences.new(educator, school, {})
#     #   end_time: end_time,
#     #   cutoff_time: cutoff_time
#     # })
#     d = chronic.data
#     next if d[:students_with_events].size == 0

#     # how many chronically absent?
#     chronically_absent_students = d[:students_with_events].select {|s| s[:rate] < 0.90 }
#     rate = chronically_absent_students.size / d[:students_with_events].size.to_f
#     record = {
#       school: school.as_json,
#       chronically_absent_students: chronically_absent_students,
#       students_count: d[:students_with_events].size,
#       chronically_absent_students_count: chronically_absent_students.size,
#       chronically_absent_rate: rate
#     }

#     records << record
#   end

#   title = "#{cutoff_time} - #{end_time}"
#   sep = '  |  '
#   column = 20
#   buf = 2
#   header = [
#     "Total students:".ljust(column),
#     "Chronically absent:".ljust(column),
#     "Percent of students:".ljust(column),
#     "Percent chart:".ljust(column),
#     "School:".ljust(column)
#   ].join(sep)
#   lines = records.map do |record|
#     [
#       "#{record[:students_count]}".rjust(column - buf) + (' ' * buf),
#       "#{record[:chronically_absent_students_count]}".rjust(column - buf) + (' ' * buf),
#       "#{(100 * record[:chronically_absent_rate]).round(1)}%".rjust(column - buf) + (' ' * buf),
#       "#{'=' * (record[:chronically_absent_rate] * column)}".ljust(column - buf) + (' ' * buf),
#       "#{record[:school]['name']}".ljust(column)
#     ].join(sep)
#   end
#   puts (["\n","\n",title,"\n",header, '-'*(column*7)] + lines).join("\n")
end
