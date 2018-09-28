class StudentsController < ApplicationController
  include ApplicationHelper

  before_action :authorize!, except: [
    :names,
    :sample_students_json
  ]

  # deprecated
  def show
    student = Student.find(params[:id])
    return redirect_to(v3_student_path(student)) if should_redirect_to_profile_v3?(params)

    can_access_restricted_transition_notes = authorizer.is_authorized_for_deprecated_transition_note_ui?
    chart_data = StudentProfileChart.new(student).chart_data
    @serialized_data = {
      current_educator: current_educator.as_json(methods: [:labels]),
      student: serialize_student_for_profile(student),          # School homeroom, most recent school year attendance/discipline counts
      feed: student_feed(student, restricted_notes: false),     # Notes, services
      chart_data: chart_data,                                   # STAR, MCAS, discipline, attendance charts
      dibels: student.dibels_results.select(:id, :date_taken, :benchmark),
      service_types_index: ServiceSerializer.service_types_index,
      educators_index: Educator.to_index,
      access: student.latest_access_results,
      transition_notes: student.transition_notes.as_json(dangerously_include_restricted_note_text: can_access_restricted_transition_notes),
      profile_insights: [], # not supported
      iep_document: student.latest_iep_document,
      sections: serialize_student_sections_for_profile(student),
      current_educator_allowed_sections: current_educator.allowed_sections.map(&:id),
      attendance_data: {
        discipline_incidents: student.discipline_incidents.order(occurred_at: :desc),
        tardies: student.tardies.order(occurred_at: :desc),
        absences: student.absences.order(occurred_at: :desc)
      }
    }
    render 'shared/serialized_data'
  end

  # deprecated
  def restricted_notes
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_view_restricted_notes

    student = Student.find(params[:id])
    @serialized_data = {
      current_educator: current_educator,
      student: serialize_student_for_profile(student),
      feed: student_feed(student, restricted_notes: true),
      educators_index: Educator.to_index,
    }
    render 'shared/serialized_data'
  end

  def photo
    student = Student.find(params[:id])

    @student_photo = student.student_photos.order(created_at: :desc).first

    return render json: { error: 'no photo' }, status: 404 if @student_photo.nil?

    @s3_filename = @student_photo.s3_filename

    object = s3.get_object(key: @s3_filename, bucket: ENV['AWS_S3_PHOTOS_BUCKET'])

    send_data object.body.read, filename: @s3_filename, type: 'image/jpeg'
  end

  def latest_iep_document
    puts "latest_iep_document..."
    # guard
    safe_params = params.permit(:id)
    student = Student.find(safe_params[:id])
    iep_document = student.latest_iep_document
    puts "iep_document: #{iep_document}"
    raise ActiveRecord::RecordNotFound if iep_document.nil?
    authorized_or_raise! { iep_document.student }

    # download
    puts "downloading..."
    filename = iep_document.pretty_filename_for_download
    pdf_bytes = IepStorer.unsafe_read_bytes_from_s3(s3, iep_document)
    send_data pdf_bytes, filename: filename, type: 'application/pdf', disposition: 'inline'
  end

  # post
  def service
    clean_params = params.require(:service).permit(*[
      :student_id,
      :service_type_id,
      :date_started,
      :provided_by_educator_name,
      :estimated_end_date
    ])

    estimated_end_date = clean_params["estimated_end_date"]

    service = Service.new(clean_params.merge({
      recorded_by_educator_id: current_educator.id,
      recorded_at: Time.now
    }))

    serializer = ServiceSerializer.new(service)

    if service.save
      if estimated_end_date.present? && estimated_end_date.to_time < Time.now
        service.update_attributes(:discontinued_at => estimated_end_date.to_time, :discontinued_by_educator_id => current_educator.id)
      end
      render json: serializer.serialize_service
    else
      render json: { errors: service.errors.full_messages }, status: 422
    end
  end

  # Used by the search bar to query for student names
  def names
    cached_json_for_searchbar = current_educator.student_searchbar_json

    if cached_json_for_searchbar
      render json: cached_json_for_searchbar
    else
      render json: SearchbarHelper.names_for(current_educator)
    end
  end

  # Admin only; get a sample of students for looking at data across the site
  def sample_students_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access?

    seed = params.fetch(:seed, '42').to_i
    n = params.fetch(:n, '40').to_i
    authorized_sample_students = authorized do
      Student.active.sample(n, random: Random.new(seed))
    end
    sample_students_json = authorized_sample_students.as_json({
      only: [:id, :grade, :first_name, :last_name],
      include: {
        school: {
          only: [:id, :name, :school_type]
        }
      }
    })
    render json: {
      sample_students: sample_students_json
    }
  end

  private
  def authorize!
    student = Student.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def should_redirect_to_profile_v3?(params)
    return false if params.has_key?(:please)
    !EnvironmentVariable.is_true('DISABLE_STUDENT_PROFILE_V3')
  end

  def serialize_student_for_profile(student)
    # These are serialized, even if importing these is disabled
    # and the value is nil.
    per_district_fields = {
      house: student.house,
      counselor: student.counselor,
      sped_liaison: student.sped_liaison
    }

    student.as_json.merge(per_district_fields).merge({
      has_photo: (student.student_photos.size > 0),
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      school_name: student.try(:school).try(:name),
      school_type: student.try(:school).try(:school_type),
      homeroom_name: student.try(:homeroom).try(:name),
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      restricted_notes_count: student.event_notes.where(is_restricted: true).count,
    }).stringify_keys
  end

  def serialize_student_sections_for_profile(student)
    student.sections_with_grades.as_json({:include => { :educators => {:only => :full_name}}, :methods => :course_description})
  end

  # The feed of mutable data that changes most frequently and is owned by Student Insights.
  # restricted_notes: If false display non-restricted notes, if true display only restricted notes.
  def student_feed(student, restricted_notes: false)
    {
      event_notes: student.event_notes
        .select {|note| note.is_restricted == restricted_notes}
        .map {|event_note| EventNoteSerializer.dangerously_include_restricted_note_text(event_note).serialize_event_note },
      transition_notes: student.transition_notes
        .select {|note| note.is_restricted == restricted_notes},
      services: {
        active: student.services.active.map {|service| ServiceSerializer.new(service).serialize_service },
        discontinued: student.services.discontinued.map {|service| ServiceSerializer.new(service).serialize_service }
      },
      deprecated: {
        interventions: student.interventions.map { |intervention| DeprecatedInterventionSerializer.new(intervention).serialize_intervention }
      }
    }
  end

  def school_year_id_range(from_date, to_date)
    # Find the years represented by the dates

    #start with to_date and work backward each year until < from_date
    current_date = to_date
    school_year_ids = []

    while current_date > from_date do
      school_year_ids.push(DateToSchoolYear.new(current_date).convert.id)

      current_date = current_date - 1.year
    end

    return school_year_ids

  end

  def s3
    if EnvironmentVariable.is_true('USE_PLACEHOLDER_STUDENT_PHOTO')
      @client ||= MockAwsS3.with_student_photo_mocked
    else
      @client ||= Aws::S3::Client.new
    end
  end
end
