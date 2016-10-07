class WeeklyUpdate
  def initialize
    @today = Date.today
    @reporting_period_in_days = 7
    @absences_threshold = 2
    @tardies_threshold = 2
    @column_width = 20
  end

  # Return a string
  def run
    output = []

    schools_for_report.each do |school_hash|
      output << school_hash[:name]
      output << events_table_for_school(school_hash, :absences, 'absences', @absences_threshold)
      output << events_table_for_school(school_hash, :tardies, 'tardies', @tardies_threshold)
      output << ""
    end


    output.join("\n")
  end

  # Prints to stdout and sends an email to each address in `target_emails`
  def run_and_email!(mailgun_url, target_emails)
    puts 'Running report...'
    report_text = run()
    puts 'Done.'
    puts
    puts 'Report output:'
    puts report_text
    puts

    puts 'Sending emails...'
    target_emails.each do |target_email|
      date_text = DateTime.now.beginning_of_day.strftime('%B %e, %Y')
      post_data = Net::HTTP.post_form(URI.parse(mailgun_url), {
        :from => "Student Insights job <kevin.robinson.0@gmail.com>",
        :to => target_email,
        :subject => "Student Insights Weekly update for educators for #{date_text}",
        :html => "<html><body><pre style='font: monospace; font-size: 12px;'>#{report_text}</pre>"
      })
      puts "to: #{target_email}"
      puts "code: #{post_data.code}"
      puts "body: #{post_data.body}"
      puts
    end

    puts
    puts 'Done.'
  end

  private
  def schools_for_report
    local_ids = ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS']
    local_ids.map do |local_id|
      school = School.find_by_local_id(local_id)
      { name: school.name, id: school.id }
    end
  end

  def print_header(columns_text)
    output = []
    output << print_row(columns_text)
    output << '---------------------------------------------------'
    output.join "\n"
  end

  def print_row(row)
    row.map do |value|
      value.to_s.ljust(@column_width)
    end.join('')
  end

  # table is a list of lists
  def print_table(table)
    table.map do |row|
      print_row(row)
    end.join("\n")
  end

  def events_table_for_school(school_hash, method_name, plural_text, greater_than_threshold)
    output = []
    table = events_for_school(school_hash[:id], method_name, greater_than_threshold)
    if table.size > 0
      output << plural_text.upcase
      output << print_header([
        'Last week',
        'Total',
        'Student',
      ])
      output << print_table(table)
    else
      output << "#{school_hash[:name]}: No students with more than #{greater_than_threshold} #{plural_text.downcase}."
    end
    output.join("\n")
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
      ]
    end
  end

  def events_in_the_last_week(student, method_name)
    student.most_recent_school_year.send(method_name).where(
      "occurred_at >= ?", @today.beginning_of_day - @reporting_period_in_days.days
    ).count
  end

end
