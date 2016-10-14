class WeeklyUpdateMailer < ActionMailer::Base

  def weekly_update
    @today = Date.today
    @reporting_period_in_days = 7
    @absences_threshold = 2
    @tardies_threshold = 2
    @column_width = 20
    @data = data

    @target_emails = 'asoble@gmail.com' # ENV['WEEKLY_UPDATE_EMAILS_LIST'].split(',')
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
        tardies: events_for_school(school_hash[:id], :tardies, @tardies_threshold)
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

  def events_in_the_last_week(student, method_name)
    student.most_recent_school_year.send(method_name).where(
      "occurred_at >= ?", @today.beginning_of_day - @reporting_period_in_days.days
    ).count
  end

end
