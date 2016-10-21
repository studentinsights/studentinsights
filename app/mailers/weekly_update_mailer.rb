class WeeklyUpdateMailer < ActionMailer::Base

  def weekly_update
    @today = Date.today
    @reporting_period_in_days = 7

    @absences_threshold = 2
    @tardies_threshold = 2
    @mtss_watchlist_threshold_in_days = 14
    @sst_watchlist_threshold_in_days = 14

    @column_width = 20
    @data = data

    @target_emails = ENV['WEEKLY_UPDATE_EMAILS_LIST'].split(',')
    @date_text = DateTime.now.beginning_of_day.strftime('%B %e, %Y')
    @subject = "Student Insights Weekly update for educators for #{@date_text}"

    mail(
      to: @target_emails,
      subject: @subject,
      from: "Student Insights job <kevin.robinson.0@gmail.com>"
    )
  end

  def data
    schools_for_report.map do |school_hash|
      school_hash.merge({
        absences: events_for_school(school_hash[:id], :absences, @absences_threshold),
        tardies: events_for_school(school_hash[:id], :tardies, @tardies_threshold),
        mtss_watchlist: watchlist_for_school(school_hash[:id], @mtss_watchlist_threshold_in_days, 301),
        sst_watchlist: watchlist_for_school(school_hash[:id], @sst_watchlist_threshold_in_days, 300)
      })
    end
  end

  def schools_for_report
    local_ids = ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS']
    local_ids.map do |local_id|
      school = School.find_by_local_id(local_id)
      { name: school.name, id: school.id }
    end
  end

  def events_for_school(school_id, method_name, greater_than_value)
    students = School.find(school_id).students.active.select do |student|
      events_in_the_last_week(student, method_name) > greater_than_value
    end

    sorted_students = students.sort_by do |student|
      events_in_the_last_week(student, method_name)
    end.reverse

    sorted_students.map do |student|
      [
        events_in_the_last_week(student, method_name),
        student.most_recent_school_year.send(method_name).size,
        "#{student.last_name}, #{student.first_name}",
        student.id
      ]
    end
  end

  def watchlist_for_school(school_id, threshold, event_note_type_id)
    watchlist = []

    School.find(school_id).students.active.each do |student|
      # Students who have been in MTSS, and more than `threshold` days have passed
      # without another note
      start_of_school_year_date = DateToSchoolYear.new(Date.today).convert.start
      most_recent_note = student.event_notes
        .where(event_note_type_id: event_note_type_id)
        .where('recorded_at >= ?', start_of_school_year_date)
        .order(recorded_at: :desc).first
      next unless most_recent_note.present?
      next unless most_recent_note.recorded_at < @today.beginning_of_day - threshold.days

      days_since = (@today - most_recent_note.recorded_at.to_date).to_i
      watchlist << {
        student: student,
        days_since: days_since
      }
    end

    watchlist.sort_by do |watchlist_row|
      watchlist_row[:days_since]
    end.reverse
  end

  def events_in_the_last_week(student, method_name)
    student.most_recent_school_year.send(method_name).where(
      "occurred_at >= ?", @today.beginning_of_day - @reporting_period_in_days.days
    ).count
  end

end
