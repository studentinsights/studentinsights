require 'csv'

class ReadingDebugController < ApplicationController
  before_action :ensure_authorized_for_feature!

  def reading_debug_json
    students, groups = reading_debug()
    students_json = students.as_json(only: [
      :id,
      :first_name,
      :last_name,
      :grade,
      :has_photo
    ])
    render json: {
      students: students_json,
      groups: groups
    }
  end

  def reading_debug_csv
    students, groups = reading_debug()
    students_by_id = students.reduce({}) {|map, s| map.merge(s.id => s)}

    # flatten
    csv_text = CSV.generate do |csv|
      csv << [
        'student.local_id',
        'student.full_name',
        'student.grade_now',
        'student.school_id_now',
        'data_point.grid_key',
        'data_point.benchmark_school_year',
        'data_point.benchmark_period_key',
        'data_point.json[value]',
        'data_point.id'
      ]

      groups.each do |group, data_points|
        data_points.each do |data_point|
          student = students_by_id[data_point.student_id]
          csv << [
            student.local_id,
            "#{student.last_name}, #{student.first_name}",
            student.grade,
            student.school_id,
            data_point.grid_key(student),
            data_point.benchmark_school_year,
            data_point.benchmark_period_key,
            data_point.json['value'],
            data_point.id
          ]
        end
      end
    end

    # download
    filename = [
      'reading_debug',
      Time.now.strftime("%Y%m%d-%H%M%S"),
      current_educator.login_name,
      PerDistrict.new.district_key
    ].join('_') + '.csv'
    send_data csv_text, filename: filename, type: 'text/csv', disposition: 'inline'
  end

  def star_reading_debug_json
    grades = ['2','3','4','5','6','7','8']
    students = authorized { Student.active.where(grade: grades).to_a }
    json = StarDebugQueries.new.fetch_json(students)
    render json: json.merge(grades: grades)
  end

  private
  def ensure_authorized_for_feature!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_reading_debug')
  end

  def reading_debug
    students = authorized { Student.active.to_a }
    groups = ReadingQueries.new.groups_for_grid(students)
    [students, groups]
  end
end
