# group a path into a string key (eg, representing an endpoint)
def action(path, options = {})
  if path.start_with?('/assets')
    '[assets]'
  elsif path.start_with?('/build')
    '[build]'
  elsif path.start_with?('/wp-content') || path == '/modules/mod_artuploader/upload.php'
    '[hacking]'
  elsif path == '/robots.txt' || path == '/favicon.ico' || path == '/browserconfig.xml'
    '[config]'
  else
    begin
      match = Rails.application.routes.recognize_path(path, options)
      "#{match[:controller]}##{match[:action]}"
    rescue => err
      path
    end
  end
end

# Count how many rows are for a class of status codes (eg, 2xx)
def percentage_status_code(rows, number)
  count = rows.select {|row| row[4].start_with?(number.to_s) }.size
  percentage = count / rows.size.to_f
  (percentage * 100).round.to_s + '%'
end


namespace :logs do
  desc 'Convert logs to JSON'
  task analyze: :environment do
    # load log and parse raw log files for the values we care about
    filename = ARGV[1]
    rows = []
    bad_lines = []
    File.readlines(filename).each do |line|
      regex = /.*(\d\d\d\d-\d\d-\d\d)T.*method=(\w*)\spath="(.*)"\shost=.*service=(\d*)ms status=(\d\d\d).* protocol=.*/
      matches = regex.match(line)
      if matches.nil?
        # debug unparseable lines puts line
        bad_lines << line
      else
        row = [matches[1], matches[2], matches[3], matches[4], matches[5]]
        rows << row
      end
    end

    # group by endpoint
    file_group = rows.group_by do |row|
      path = action(row[2], method: row[1])
    end

    # compute metrics
    records = []
    file_group.each do |key, values| 
      stats = DescriptiveStatistics::Stats.new(values.map {|row| row[3].to_i })
      records << [
        values.size,
        '|',
        percentage_status_code(values, '2'),
        percentage_status_code(values, '3'),
        percentage_status_code(values, '4'),
        percentage_status_code(values, '5'),
        '|',
        "#{stats.value_from_percentile(50).to_i}ms",
        "#{stats.value_from_percentile(90).to_i}ms",
        "#{stats.value_from_percentile(95).to_i}ms",
        '|',
        key
      ]
    end

    # sort and output
    sorted = records.sort_by {|record| record[7].to_i * -1 }
    puts ['count', '', '2xx', '3xx', '4xx', '5xx', '', 'p50', 'p90', 'p95', '', 'key'].join("\t")
    puts ['---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---'].join("\t")
    sorted.each {|record| puts record.join("\t") }

    # data range
    dates = rows.map {|row| Date.parse(row[0].slice(0, 10)) }.sort
    puts
    puts "Includes #{rows.size} log lines over #{(dates.last - dates.first).to_i} days (from #{dates.first} to #{dates.last})."
    puts "Skipped #{bad_lines.size} log lines that could not be parsed."
  end
end