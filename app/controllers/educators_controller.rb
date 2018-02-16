class EducatorsController < ApplicationController
  # Authentication by default inherited from ApplicationController.
  NOTES_FEED_TIME_INTERVAL = Date.today - 2400 # TODO: change to 30 before merging

  before_action :authenticate_districtwide_access!, only: [:districtwide_admin_homepage] # Extra authentication layer

  def homepage
    redirect_to homepage_path_for_role(current_educator)
  end

  def districtwide_admin_homepage
    @schools = School.all
  end

  def names_for_dropdown
    student = Student.find(params[:id])
    school = student.school

    if school.nil?
      render json: [] and return
    end

    render json: filtered_names(params[:term], school)
  end

  def notes_feed
    notes = EventNote.includes(:student)
            .where(educator_id: current_educator.id)
            .where("recorded_at >= ?", NOTES_FEED_TIME_INTERVAL)
            .order("recorded_at DESC")
    @serialized_data = {
      educators_index: Educator.to_index,
      event_note_types_index: EventNoteSerializer.event_note_types_index,
      current_educator: current_educator,
      notes: notes.map {|event_note| EventNoteSerializer.new(event_note).serialize_event_note_with_student },
    }
    render 'shared/serialized_data'
  end

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable
    respond_to do |format|
      format.json { render json: :ok }
    end
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
