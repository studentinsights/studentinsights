class EducatorsController < ApplicationController
  # Authentication by default inherited from ApplicationController.
  DEFAULT_BATCH_SIZE = 30

  before_action :authenticate_districtwide_access!, only: [:districtwide_admin_homepage] # Extra authentication layer

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
        :grade_level_access
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
    students = authorized { Student.active.includes(:school).to_a }
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

  def districtwide_admin_homepage
    @schools = PerDistrict.new.ordered_schools_for_admin_page
  end

  def names_for_dropdown
    student = Student.find(params[:id])
    school = student.school

    if school.nil?
      render json: [] and return
    end

    render json: filtered_names(params[:term], school)
  end

  def notes_feed_json
    batch_size = params["batch_size"].to_i
    serialized_data = notes_feed_data(batch_size)
    render json: serialized_data
  end

  def notes_feed
    @serialized_data = notes_feed_data(DEFAULT_BATCH_SIZE)
    render 'shared/serialized_data'
  end

  def notes_feed_data(batch_size)
    total_notes_for_educator = EventNote.where(educator_id: current_educator.id).count
    notes = EventNote.includes(:student)
            .where(educator_id: current_educator.id)
            .order("recorded_at DESC")
            .limit(batch_size)
    {
      educators_index: Educator.to_index,
      current_educator: current_educator,
      notes: notes.map {|event_note| EventNoteSerializer.dangerously_include_restricted_note_text(event_note).serialize_event_note_with_student },
      total_notes_count: total_notes_for_educator
    }
  end

  # Send arbitrary request to reset Devise Timeoutable
  def reset_session_clock
    render json: { status: 'ok' }
  end

  private
  def authenticate_districtwide_access!
    unless current_educator.districtwide_access
      redirect_to not_authorized_path
    end
  end

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
