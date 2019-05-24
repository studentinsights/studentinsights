class CounselorMeetingsController < ApplicationController
  before_action :ensure_authorized_for_feature!

  # post
  def create
    params.require(:student_id)
    params.require(:meeting_date)

    student = authorized_or_raise! do
      Student.find(params[:student_id])
    end
    meeting = CounselorMeeting.create!({
      educator_id: current_educator.id,
      student_id: student.id,
      meeting_date: Date.parse(params[:meeting_date])
    })

    render json: {
      id: meeting.id
    }
  end

  def meetings_json
    students = authorized { Student.active.includes(:school, :student_photos).to_a }
    meetings = CounselorMeeting.all.where(student_id: students.map(&:id))
    render json: {
      educators_index: Educator.to_index,
      meetings: meetings,
      students: students_json(students)
    }
  end

  def student_feed_cards_json
    params.require(:student_id)
    params.permit(:time_now)
    student = authorized_or_raise! { Student.find(params[:student_id]) }
    time_now = time_now_or_param(params[:time_now])
    limit = 10

    # Load feed cards just for this student
    feed = Feed.new([student])
    feed_cards = feed.all_cards(time_now, limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  private
  def ensure_authorized_for_feature!
    current_educator.labels.include?('enable_counselor_meetings_page')
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