class CounselorNotesController < ApplicationController
  before_action :ensure_authorized_for_feature!

  def create
    params.require(:student_id)
    params.require(:meeting_date)

    student = authorized_or_raise! do
      Student.find(params[:student_id])
    end

    meeting = CounselorMeeting.create!({
      educator_id: current_educator.id,
      meeting_date: params[:meeting_date],
      student_id: params[:student_id]
    })

    render json: {
      id: meeting.id
    }
  end

  def meetings_json
    students = authorized { Student.active.includes(:school, :student_photos).to_a }
    meetings = CounselorMeeting.all.where(student_id: students.map(&:id))
    render json: {
      meetings: meetings,
      students: students_json(students)
    }
  end

  def inline_profile_json
    params.require(:student_id)
    params.permit(:time_now)
    params.permit(:limit)
    student = authorized_or_raise! { Student.find(params[:student_id]) }
    time_now = time_now_or_param(params[:time_now])
    limit = params.has_key?(:limit) ? params[:limit].to_i : 10;

    # Load feed cards just for this student
    feed = Feed.new([student])
    feed_cards = feed.all_cards(time_now, limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  private
  def ensure_authorized_for_feature!
    current_educator.labels.include?('enable_counselor_notes_page')
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  def students_json(students)
    students.as_json({
      only: [
        :id,
        :first_name,
        :last_name,
        :grade,
        :house,
        :counselor,
        :sped_liaison,
        :program_assigned,
        :sped_placement
      ],
      methods: [
        :has_photo
      ],
      include: {
        school: {
          only: [:id, :name]
        }
      }
    })
  end
end