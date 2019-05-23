class CounselorNotesController < ApplicationController
  before_action :ensure_authorized_for_feature!


  def create
    # 1. check the browser sent the correct
    #    data (params.require)

    # 2. find the student they are talking about
    #    (Student.find)

    # 3. does this user have access to this
    #    student? (authorized_or_raise!)

    # 4. write a "migration" to create a new
    #    table (use event_notes as a model).

    # 5. add a new "model" to read from that table
    #    (counselor_meeting.rb)

    # 6. create the note in the
    #    database! (CounselorMeeting)

    # 7. Tell the browser we are done
    render json: { status: 'ok' }
  end

  def meetings_json
    # 8. Read the meetings from the database
    #    (CounselorMeeting)
    meetings = []
    
    students = authorized { Student.active.includes(:school, :student_photos).to_a }
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