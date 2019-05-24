class CounselorMeetingsController < ApplicationController
  before_action :ensure_authorized_for_feature!

  # post
  def create
    params.require(:student_id)
    params.require(:meeting_date)

    student = find_authorized_student_or_raise!(params[:student_id])
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
    params.permit(:school_year)
    school_year = params.fetch(:school_year, SchoolYear.to_school_year(Time.now))

    students = authorized do
      allowed_students.includes(:school, :student_photos).to_a
    end
    first_day_of_school = SchoolYear.first_day_of_school_for_year(school_year)
    meetings = CounselorMeeting.all
      .where(student_id: students.map(&:id))
      .where('meeting_date >= ?', first_day_of_school)
    render json: {
      educators_index: Educator.to_index,
      school_year: school_year,
      meetings: meetings,
      students: students_json(students)
    }
  end

  def student_feed_cards_json
    params.require(:student_id)
    params.permit(:time_now)
    student = find_authorized_student_or_raise!(params[:student_id])

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
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_counselor_meetings_page')
  end

  # Also restrict by grade
  def find_authorized_student_or_raise!(student_id)
    authorized_or_raise! do
      allowed_students.find(student_id) # can raise a 404
    end
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  # Limit by grade and school
  def allowed_students
    allowed_grades = ['9', '10', '11', '12']
    allowed_school_ids = [School.find_by_local_id('SHS').try(:id)].compact

    Student.active
      .where(grade: allowed_grades)
      .where(school_id: allowed_school_ids)
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
