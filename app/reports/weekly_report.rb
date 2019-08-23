# Reports on aggregate, non-personally identifiable usage data.
# Intended to be run weekly.
class WeeklyReport
  def initialize(options = {})
    @time_now = options.fetch(:time_now, Time.now)
    @weeks_count = options.fetch(:weeks_count, 12)
    @reporting_period_in_days = @weeks_count * 7
    @schools = options.fetch(:schools, School.all)
    @project_lead_educator_ids = options.fetch(:project_lead_educator_ids, default_project_lead_educator_ids)
    @log = options.fetch(:log, STDOUT)

    @buffer = []
  end

  # Returns a string
  def run
    @buffer = []

    output "Hello #{PerDistrict.new.district_name}!"
    output
    output "This is the usage report for Student Insights in #{PerDistrict.new.district_name}."
    output 'It shows the number of visits and the number of unique users each week.'
    output 'It also shows the number of notes created in Student Insights, and the number '
    output 'of unique users creating them each week.'
    output 'For these reports, a week starts on Monday and ends on Sunday.'
    output
    output 'Unique users is the better number to watch, since visits and counts will be more variable.'
    output 'The total across all schools is shown first, with individual schools after.'
    output 'For usage, data is grouped based on educator\'s school.'
    output 'For notes, data is grouped based on the student\'s school.'
    output
    output 'Please reply to this email if you have any questions!'
    output

    output
    output
    output
    output "#{PerDistrict.new.district_name}: Student Insights usage (n=#{Educator.active.size})"
    output usage_table(include_project_leads: true)
    output
    output
    output
    output line_break('_')
    output
    output
    output

    output "Project leads (n=#{@project_lead_educator_ids.size})"
    output usage_table(only_project_leads: true)
    output
    output
    @schools.each do |school|
      output school.name
      output usage_table(school_id: school.id)
      output
      output
    end
    output "Usage: Educators with no school (n=#{educators_with_nil_school.size})"
    output usage_table(school_id: nil)
    output
    output

    @buffer.join("\n")
  end

  # Prints to stdout and sends an email to each address in `target_emails`
  def run_and_email!(mailgun_url, target_emails)
    log 'Running report...'
    report_text = run()
    log 'Done.'
    log

    log "Sending #{target_emails.size} emails..."
    target_emails.each do |target_email|
      date_text = @time_now.beginning_of_day.strftime('%B %e, %Y')
      post_data = Net::HTTP.post_form(URI.parse(mailgun_url), {
        :from => "Student Insights job <kevin.robinson.0@gmail.com>",
        :to => target_email,
        :subject => "#{PerDistrict.new.district_key} - Student Insights Usage Report for #{date_text}",
        :html => "<html><body><pre style='font: monospace; font-size: 12px;'>#{report_text}</pre>"
      })
      log "  response status: #{post_data.code}"
    end
    log 'Done.'
  end

  private
  def default_project_lead_educator_ids
    Educator.where(can_set_districtwide_access: true).pluck(:id)
  end

  def educators_with_nil_school
    Educator.where(school_id: nil).pluck(:id)
  end

  def output(string = '')
    @buffer << string
    nil
  end

  def indent(string = '')
    @buffer << "\t#{string.split("\n").join("\n\t")}"
    nil
  end

  def line_break(char = '-')
    70.times.map { char }.join('')
  end

  def blank_if_zero(value)
    if value == 0 then '' else value end
  end

  def blank_if_zero_percent(string)
    if string == '0%' then '' else blank_if_zero(string) end
  end

  def usage_table(options = {})
    # filters
    end_date = (@time_now.beginning_of_week).end_of_day.to_date
    start_date = (end_date - @weeks_count.weeks).beginning_of_day.to_date
    logins = LoginActivity
      .where(success: true)
      .where.not(user_id: nil)
      .where('created_at >= ?', start_date.beginning_of_day)
      .where('created_at <= ?', end_date.end_of_day)

    # Count schools, or nil school
    if options.has_key?(:school_id)
      user_id = options[:school_id].nil? ? educators_with_nil_school : School.find(options[:school_id]).educators.pluck(:id)
      logins = logins.where(user_id: user_id)
    end

    # Default to excluding project leads, unless explicitly asked, also allow limiting to just them
    if options[:only_project_leads]
      logins = logins.where(user_id: @project_lead_educator_ids)
    elsif !options[:include_project_leads]
      logins = logins.where.not(user_id: @project_lead_educator_ids)
    end

    # for joining notes
    notes_by_week = notes_per_week(options)

    # group and count, filling in blanks
    logins_by_week = logins.group_by {|login| login.created_at.beginning_of_week.beginning_of_day.to_date }
    weekly_metrics = (0..@weeks_count-1).map do |week_number|
      week_start_date = (end_date - (@weeks_count - week_number).weeks).beginning_of_week.beginning_of_day.to_date
      logins_that_week = logins_by_week.fetch(week_start_date, [])
      notes_that_week = notes_by_week.fetch(week_start_date, [])
      uniques = logins_that_week.pluck(:user_id).uniq.size
      writers = notes_that_week.pluck(:educator_id).uniq.size
      [
        week_start_date.strftime('%Y-%m-%d'),
        blank_if_zero(writers),
        blank_if_zero(uniques),
        blank_if_zero_percent(uniques == 0 ? 0 : (100*writers/uniques.to_f).round(0).to_s + '%'),
        blank_if_zero(notes_that_week.size),
        blank_if_zero(logins_that_week.size)
      ]
    end

    # with header
    [
      line_break,
      ["Date\t", 'Writers', 'Users', '%Writer', 'Notes', 'Logins'].join("\t"),
      weekly_metrics.map {|line| line.first(6).join("\t") }
    ].flatten.join("\n")
  end

  def notes_per_week(options = {})
    # Allow querying for a school or all schools or `nil` school
    where_school = if options.has_key?(:school_id) then {:students => { school_id: options[:school_id] }} else {} end
    event_notes = EventNote
      .joins(:student)
      .where(where_school)
      .where('recorded_at > ?', @time_now.to_date - @reporting_period_in_days.days)

    # Default to excluding project leads, unless explicitly asked, also allow limiting to just them
    unless options[:include_project_leads]
      event_notes = event_notes.where.not(educator_id: @project_lead_educator_ids)
    end
    if options[:only_project_leads]
      event_notes = event_notes.where(educator_id: @project_lead_educator_ids)
    end

    # Group by week
    notes_per_week = event_notes.group_by {|event_note| event_note.recorded_at.to_date.beginning_of_week.beginning_of_day.to_date }
    (0..@reporting_period_in_days).each do |days_back|
      monday = (@time_now.to_date - days_back.days).beginning_of_week.beginning_of_day.to_date
      notes_per_week[monday] = [] unless notes_per_week.has_key?(monday)
    end
    notes_per_week
  end

  def log(msg = '')
    @log.puts msg
  end
end
