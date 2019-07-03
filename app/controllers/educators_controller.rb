class EducatorsController < ApplicationController
  # Allow the :probe endpoint to be called without extending
  # Devise Timeoutable
  prepend_before_action only: [:probe] do
    request.env['devise.skip_trackable'] = true
  end

  # Authentication by default inherited from ApplicationController.
  DEFAULT_BATCH_SIZE = 30

  def homepage
    redirect_to homepage_path_for_role(current_educator)
  end

  # This is internal-only for now.
  def show
    raise Exceptions::EducatorNotAuthorized unless current_educator.districtwide_access
    educator = Educator.find(params[:id])
    render json: educator.as_json({
      :only => [
        :id,
        :email,
        :full_name,
        :staff_type,
        :restricted_to_sped_students,
        :restricted_to_english_language_learners,
        :can_view_restricted_notes,
        :schoolwide_access,
        :districtwide_access,
        :grade_level_access,
        :admin
      ],
      :methods => [:labels],
      :include => {
        :school => { :only => [:id, :name] },
        :sections => {
          :only => [:id, :section_number],
          :methods => [:course_description]
        },
        :homeroom => { :only => [:id, :name] }
      }
    })
  end

  def my_students_json
    students = authorized { Student.active.includes(:school, :student_photos).to_a }
    students_json = students.as_json({
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
    render json: {
      students: students_json
    }
  end

  def services_json
    render json: {
      services: JSON.parse(IO.read('/Users/krobinson/Desktop/0. DANGER/2019-07-03-services-somerville/service_somerville.json'))
    }
    # students = authorized { Student.active.includes(:services, :school, :homeroom, :student_photos).to_a }
    # services = students.flat_map(&:services)
    # services_json = services.as_json({
    #   include: {
    #     service_type: {
    #       only: [:id, :name]
    #     },
    #     student: {
    #       methods: [:has_photo],
    #       include: {
    #         school: {
    #           only: [:id, :name]
    #         },
    #         homeroom: {
    #           only: [:id, :name]
    #         }
    #       }
    #     }
    #   }
    # })
    # render json: {
    #   services: services_json
    # }
  end

  # Used by the search bar to query for student names
  def student_searchbar_json
    json = EducatorSearchbar.student_searchbar_json_for(current_educator, {
      compute_if_missing: true
    })
    render json: json
  end

  # Used for services
  def names_for_dropdown
    student = Student.find(params[:id])
    school = student.school

    if school.nil?
      render json: [] and return
    end

    render json: filtered_names(params[:term], school)
  end

  def my_notes_json
    safe_params = params.permit(:batch_size)
    batch_size = safe_params[:batch_size].to_i
    authorized_notes = authorized do
      EventNote.includes(:student)
        .where(educator_id: current_educator.id)
        .order('recorded_at DESC')
    end

    # Merged both event_notes and feed_card json
    mixed_event_notes_json = authorized_notes.first(batch_size).map do |event_note|
      event_note_json = EventNoteSerializer.safe(event_note).serialize_event_note
      card_json = FeedCard.event_note_card(event_note).json
      event_note_json.merge(card_json)
    end

    render json: {
      current_educator: current_educator.as_json(only: [:id, :can_view_restricted_notes]),
      mixed_event_notes: mixed_event_notes_json,
      total_notes_count: authorized_notes.size
    }
  end

  # Send arbitrary request to reset Devise Timeoutable
  def reset_session_clock
    render json: { status: 'ok' }
  end

  # For checking if the session is still active, without
  # extending Devise Timeoutable by the request itself (see
  # action hook above)
  # Handles missing values by assuming the session has no time left.
  def probe
    last_request_at = educator_session.fetch('last_request_at', 0)
    seconds_ago = Time.now.to_i - last_request_at
    remaining_seconds = [0, Devise.timeout_in - seconds_ago].max
    render json: {
      status: 'ok',
      remaining_seconds: remaining_seconds
    }
  end

  private
  def filtered_names(term, school)
    unfiltered = (school.educator_names_for_services + Service.provider_names).uniq.compact

    return unfiltered.sort_by(&:downcase) if term.nil?  # Handle missing param

    filtered = unfiltered.select do |name|
      split_name = name.split(', ')   # SIS name format expected
      split_name.any? { |name_part| match?(term, name_part) } || match?(term, name)
    end

    return filtered.sort_by(&:downcase)
  end

  def match?(term, string_to_test)
    term.downcase == string_to_test.slice(0, term.length).downcase
  end

end
