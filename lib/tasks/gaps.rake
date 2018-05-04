namespace :gaps do
  desc 'Report on gaps in low grades across roles'
  task low_grades: :environment do
    time_now = Time.now
    limit = 100
    time_threshold = time_now - 45.days
    grade_threshold = 69

    # Run query for each educator
    educator_ids = EducatorLabel.where(label_key: 'shs_experience_team').map(&:educator_id)
    educators = Educator.where(id: educator_ids)
    rows = educators.map do |educator|
      insight = InsightStudentsWithLowGrades.new(educator)
      students_with_low_grades_json = insight.students_with_low_grades_json(time_now, time_threshold, grade_threshold)
      {
        educator: educator,
        students_with_low_grades_json: students_with_low_grades_json
      }
    end

    # Sort and print
    delim = ','
    sorted_rows = rows.sort_by {|row| -1 * row[:students_with_low_grades_json].size }
    lines = sorted_rows.map do |row|
      educator = row[:educator]
      students_with_low_grades_json = row[:students_with_low_grades_json]
      top_names = students_with_low_grades_json.first(10).map do |s|
        "#{s['student']['first_name']} #{s['student']['last_name']}"
      end
      [educator.email, students_with_low_grades_json.size, top_names.join(delim)].join(delim)
    end
    puts (["email#{delim}count#{delim}students"] + lines).join("\n")
    nil
  end

  desc 'Report on gaps in high absences across roles'
  task high_absences: :environment do
    time_now = Time.now
    limit = 100
    time_threshold = time_now - 45.days
    absences_threshold = 4

    # Batch by school
    sample_size = 5
    seed = 42
    educators_by_school = Educator.all.group_by(&:school)
    educators_by_school.each do |school, educators|
      sampled_educators = educators.sample(sample_size, random: Random.new(seed))
      rows = sampled_educators.map do |educator|
        insight = InsightStudentsWithHighAbsences.new(educator)
        students_with_high_absences_json = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
        {
          educator: educator,
          students_with_high_absences_json: students_with_high_absences_json
        }
      end

      # Sort and print
      delim = ','
      sorted_rows = rows.sort_by {|row| -1 * row[:students_with_high_absences_json].size }
      lines = sorted_rows.map do |row|
        educator = row[:educator]
        students_with_high_absences_json = row[:students_with_high_absences_json]
        top_names = students_with_high_absences_json.first(10).map do |s|
          "#{s[:student]['first_name']} #{s[:student]['last_name']}"
        end
        [educator.email, students_with_high_absences_json.size].join(delim)
      end
      puts "High Absences at #{school.name} for #{time_now.strftime("%Y-%m-%d")} (#{educators.size} educators)"
      puts "-------------------------------------"
      puts (["email#{delim}count#{delim}students"] + lines).join("\n")
    end;nil

    nil
  end
end
