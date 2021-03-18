class CourseBreakdownController < ApplicationController
  before_action :ensure_authorized_for_districtwide!

  def show_json
    params.require(:school_id)
    school_id = (School.find_by_slug(params[:school_id]) || School.find_by_id(params[:school_id])).id

    render json: {
      course_breakdown: course_breakdown_json([school_id]),
      student_proportions: student_proportions
    }
  end

  private

  def course_breakdown_json(school_ids)
    courses = Course.all
      .includes(sections: { student_section_assignments: :student})
      .where(school_id: school_ids)

    course_breakdown = courses.map do |course|
      {
        course_name: course.course_description,
        course_number: course.course_number,
        section_numbers: course.sections.map {|s| s.section_number},
        is_honors: nil,
        subject: nil,
        course_year_data: course_year_data(course)
      }
    end
    course_breakdown.as_json
    # # Merge the historical and current courses together
    # all_courses_breakdown = [course_breakdown + historical_course_breakdown].group_by(course_name).map do |course_group|
    #   new_course = {}
    #   course_group.each do |course|
    #     new_course.merge(course) do  |key, v1, v2|
    #       if key === :course_year_data then
    #         v1.merge(v2)
    #       else
    #         v2
    #       end
    #     end
    #   end
    #   new_course
    # end
    # all_courses_breakdown.as_json
  end

  def historical_course_breakdown
    # Note this relies on HistoricalLevelsSnapshot only existing for Somerville High
    # students. We will want to make this relationship explicit if this feature continues
    # to get use
    historical_snapshots = HistoricalLevelsSnapshot.all

    # Assign a school year to each
    historical_snapshots.each do |snapshot|
      year = SchoolYear.to_school_year(snapshot.time_now)
      snapshot[school_year] = year
    end

    # one snapshot for each school year
    historical_snapshots_each_year = historical_snapshots.group_by(&:school_year).map do |snapshots|
      sorted_snapshots snapshots.sort_by &:created_at
      return sorted_snapshots.last
    end

    # This recreates some features of the section assignments we need
    historical_courses = historical_snapshots_each_year.map do |snapshot|
      school_year = snapshot.school_year
      unmerged_sections = snapshot.students_with_levels_json.map do |student|
        unmerged_student_sections = student.student_section_assignments_right_now.each do |section_assignment|
          section_assignment[district_school_year] = school_year
          section_assignment[student] = student
        end
      end
      unmerged_sections.flatten.group_by(course_description)
    end

    historical_course_breakown = historical_courses.map do |course|
      {
      course_name: course.course_description,
      course_year_data: course_year_data(course)
    }
    end
    historical_course_breakdown.as_json
  end

  # hash with course breakdown data keyed to the district school year
  def course_year_data(course)
    course_year_data = {}
    sections_by_year = course.sections.group_by(&:district_school_year)
    sections_by_year.each do |key, sections|
      course_year_data[key] = category_breakdown(sections)
    end
    course_year_data
  end

  def category_breakdown(sections)
    assignments = sections.map(&:student_section_assignments).flatten
    assignments_by_race = assignments.group_by {|assignment| assignment.student.race}
    assignments_by_gender = assignments.group_by {|assignment| assignment.student.gender}
    race_data_hash = group_data(assignments_by_race, "race").inject(:merge)
    gender_data_hash = group_data(assignments_by_gender, "gender").inject(:merge)
    {total_students: assignments.count}.merge(race_data_hash, gender_data_hash)
  end

  # gives a count of the number of section assignments within each group as well
  # as the group's median and mean grades. Dynamically identified since we don't know
  # all the categories that may be present in the future.
  def group_data(grouped_student_assignments, category)
    grouped_student_assignments.map do |key, group|
      name = key ? key.downcase : "not_specified"
      Hash[[
        ["#{category}_#{name}_count", group.count],
        ["#{category}_#{name}_mean_grade", group_mean(group)],
        ["#{category}_#{name}_median_grade", group_median(group)]
      ]]
    end
  end

  def group_mean(student_assignments)
    grades = student_assignments.map(&:grade_numeric)
    sum = grades.reduce(0) { |a, b| a + b }
    sum.to_f / grades.count.to_f
  end

  def group_median(student_assignments)
    sorted_grades = student_assignments.map(&:grade_numeric).sort
    median = (sorted_grades[(sorted_grades.length - 1) / 2] + sorted_grades[sorted_grades.length / 2]) / 2.0
    median.to_f
  end

  def student_proportions
    student_proportions = {}
    students = Student.all.active
    students.group_by(&:race).each do |key, value|
      name = key ? "race_#{key.downcase}_total" : "race_not_specified_total"
      student_proportions[name] = value.count
    end
    students.group_by(&:gender).each do |key, value|
      name = key ? "gender_#{key.downcase}_total" : "gender_not_specified_total"
      student_proportions[name] = value.count
    end
    {total: students.count}.merge(student_proportions).as_json
  end

  # We aren't performing auth checks on the data accessed here since none of it is
  # individualized student information, but we still want to restrict this feature
  # to those who should be looking at high level information.
  def ensure_authorized_for_districtwide!
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access
  end

end
