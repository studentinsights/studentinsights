class TieringController < ApplicationController
  def show_json
    time_now = time_now_or_param(params[:time_now])
    school_id = params[:school_id]

    students = authorized do
      Student
        .where(school_id: school_id)
        .includes(student_section_assignments: [section: :course])
    end
    students_with_tiering_json = students.map do |student|
      tier_json = SomervilleHighTiers.new.tier(student, time_now: time_now).as_json
      student_json = student.as_json({
        only: [:id, :first_name, :last_name],
        include: {
          # homeroom: {
          #   only: [:id, :name]
          # },
          student_section_assignments: {
            :only => [:id, :grade_letter, :grade_numeric],
            :include => {
              :section => {
                :only => [:id, :section_number],
                :methods => [:course_description]
                # :include => {
                #   :educators => {:only => [:id, :full_name, :email]}
                # }
              }
            }
          }
        }
      })
      {}.merge(tier_json, student_json)
    end

    students_with_tiering_json = JSON.parse(IO.read('/Users/krobinson/Desktop/DANGER-students-proto.json'))
    render json: {
      students_with_tiering: students_with_tiering_json
    }
  end

  private
  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end
end
