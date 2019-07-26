# typed: true
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
end
