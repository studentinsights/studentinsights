class TieringController < ApplicationController
  def show_json
    time_now = time_now_or_param(params[:time_now])
    school_id = params[:school_id]

    # TODO(kr) rework
    students_with_tiering_json = SomervilleHighTiers.students_with_tiering_json(current_educator, [school_id], time_now)
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
