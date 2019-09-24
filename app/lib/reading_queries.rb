class ReadingQueries
  def groups_for_grid(students)
    reading_benchmark_data_points = ReadingBenchmarkDataPoint.all
      .where(student_id: students.pluck(:id))
      .order(updated_at: :asc)

    # as an optimization, group these for the UI grid on server
    students_by_id = students.reduce({}) {|map, s| map.merge(s.id => s)}
    reading_benchmark_data_points.group_by do |d|
      student = students_by_id[d.student_id]
      d.grid_key(student)
    end
  end

  def by_homerooms_for_period(students, benchmark_period_key, benchmark_school_year)
    reading_benchmark_data_points = ReadingBenchmarkDataPoint.all
      .where(student_id: students.pluck(:id))
      .where(benchmark_period_key: benchmark_period_key)
      .where(benchmark_school_year: benchmark_school_year)
      .includes(student: {homeroom: :educator})

    eager_students = reading_benchmark_data_points.map(&:student)
    homerooms = eager_students.map {|s| s.try(:homeroom) }.compact.uniq
    
    # with data
    counts_by_homeroom_id = {}
    reading_benchmark_data_points.each do |d|
      homeroom_id = d.student.homeroom.try(:id)
      if !counts_by_homeroom_id.has_key?(homeroom_id)
        counts_by_homeroom_id[homeroom_id] = {}
      end  
      counts_by_homeroom_id[homeroom_id][d.benchmark_assessment_key] = (counts_by_homeroom_id[homeroom_id].fetch(d.benchmark_assessment_key, []) + [d.student.id]).uniq
    end
    counts = {}
    counts_by_homeroom_id.keys.each do |homeroom_id|
      if !counts.has_key?(homeroom_id)
        counts[homeroom_id] = {}
      end
      counts_by_homeroom_id[homeroom_id].keys.each do |benchmark_assessment_key|
        counts[homeroom_id][benchmark_assessment_key] = counts_by_homeroom_id[homeroom_id][benchmark_assessment_key].size
      end
    end

    # total
    total_by_homeroom_id = {}
    students.each do |s|
      homeroom_id = s.homeroom.try(:id)
      total_by_homeroom_id[homeroom_id] = (total_by_homeroom_id.fetch(homeroom_id, []) + [s.id]).uniq
    end

    # output format
    outs = homerooms.map do |homeroom|
      {
        id: homeroom.id,
        grades: homeroom.grades,
        educator: homeroom.try(:educator).as_json(only: [
          :id,
          :email,
          :full_name
        ]),
        school: homeroom.school.as_json(only: [
          :id,
          :slug,
          :local_id,
          :name,
          :school_type
        ]),
        total: total_by_homeroom_id[homeroom.id].size,
        counts: counts[homeroom.id]
      }
    end

    outs.sort_by do |o|
      [
        o[:school][:name],
        o[:grades].map {|grade| GradeLevels::ORDERED_GRADE_LEVELS.index(grade) }.sort
      ]
    end
  end
end
