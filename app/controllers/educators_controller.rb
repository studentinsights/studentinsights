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
        :missing_from_last_export,
        :admin
      ],
      :methods => [
        :active?,
        :labels
      ],
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
    students = authorized do
      Student.active.includes(:school, :student_photos, :homeroom => [:educator]).to_a
    end
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
        homeroom: {
          only: [:id, :name],
          include: {
            educator: {only: [:id, :full_name, :email]}
          }
        },
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
    students = authorized { Student.active.includes(:services, :school, :homeroom, :student_photos).to_a }
    services = students.flat_map(&:services)
    services_json = services.as_json({
      include: {
        service_type: {
          only: [:id, :name]
        },
        student: {
          only: [
            :id,
            :first_name,
            :last_name,
            :grade
          ],
          methods: [:has_photo],
          include: {
            school: {
              only: [:id, :name]
            }
          }
        }
      }
    })
    render json: {
      services: services_json
    }
  end

  # Used by the search bar to query for student names
  def student_searchbar_json
    json = EducatorSearchbar.student_searchbar_json_for(current_educator, {
      compute_if_missing: true
    })
    render json: json
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

  # Used for picking a name when creating a service, drawing from
  # active educators and from other text values entered previously.
  def possible_names_for_service_json
    # We assume that the names of most providers are public anyway
    # in many other sources (eg, public staff directory on the web).
    # So while there's no real concern with sharing staff names with
    # signed-in educators, this is still defensive and only takes
    # provider names from services that the educator is authorized to
    # view.
    student_ids = authorized { Student.active }.map(&:id)
    provider_names = Service.active
      .where(student_id: student_ids)
      .map(&:provided_by_educator_name)

    active_educator_names = Educator.active.map(&:full_name)
    names = (provider_names + active_educator_names).uniq.compact
    render json: {
      names: names
    }
  end
end
