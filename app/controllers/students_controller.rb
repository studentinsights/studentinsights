class StudentsController < ApplicationController
  include SerializeDataHelper
  include ApplicationHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :redirect_unauthorized!

  before_action :authorize!, except: [          # The :names and lasids actions are subject to
    :names, :lasids                             # educator authentication via :authenticate_educator!
  ]                                             # inherited from ApplicationController.
                                                # They then get further authorization filtering using
                                                # The custom authorization methods below.

  before_action :authorize_for_districtwide_access_admin, only: [:lasids]

  def authorize!
    student = Student.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def show
    student = Student.find(params[:id])
    chart_data = StudentProfileChart.new(student).chart_data

    @serialized_data = {
      current_educator: current_educator,
      student: serialize_student_for_profile(student),          # Risk level, school homeroom, most recent school year attendance/discipline counts
      feed: student_feed(student, restricted_notes: false),     # Notes, services
      chart_data: chart_data,                                   # STAR, MCAS, discipline, attendance charts
      dibels: student.student_assessments.by_family('DIBELS'),
      service_types_index: service_types_index,
      event_note_types_index: event_note_types_index,
      educators_index: Educator.to_index,
      access: student.latest_access_results,
      attendance_data: student_profile_attendance_data(student.student_school_years)
    }
  end

  def restricted_notes
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_view_restricted_notes

    student = Student.find(params[:id])
    @serialized_data = {
      current_educator: current_educator,
      student: serialize_student_for_profile(student),
      feed: student_feed(student, restricted_notes: true),
      event_note_types_index: event_note_types_index,
      educators_index: Educator.to_index,
    }
  end

  def sped_referral
    set_up_sped_data
    respond_to do |format|
      format.pdf do
        footer = "Somerville Public Schools Student Report -- Generated #{format_date(todays_date)} by #{current_educator.full_name} -- Page [page] of [topage]"
        render({
          pdf: 'sped_referral', 
          title: 'Student Report', 
          footer: { center: footer, font_name: 'Open Sans', font_size: 9}, 
          javascript_delay: 1000,
          show_as_html: Rails.env.development? && params.key?('debug')
        })
      end
    end
  end

  # post
  def service
    clean_params = params.require(:service).permit(*[
      :student_id,
      :service_type_id,
      :date_started,
      :provided_by_educator_name
    ])
    service = Service.new(clean_params.merge({
      recorded_by_educator_id: current_educator.id,
      recorded_at: Time.now
    }))
    if service.save
      render json: serialize_service(service)
    else
      render json: { errors: service.errors.full_messages }, status: 422
    end
  end

  # Used by the search bar to query for student names
  def names
    students_for_searchbar = SearchbarHelper.names_for(current_educator)
    render json: students_for_searchbar
  end

  # Used by the service upload page to validate student local ids
  # LASID => "locally assigned ID"
  def lasids
    render json: Student.pluck(:local_id)
  end

  private

  def student_profile_attendance_data(student_school_years)
    return {
      discipline_incidents: flatmap_and_sort(student_school_years) {|year| year.discipline_incidents },
      tardies: flatmap_and_sort(student_school_years) {|year| year.tardies },
      absences: flatmap_and_sort(student_school_years) {|year| year.absences }
    }
  end

  # Takes a list of student_school_years, yields each one to the block provided, then flattens
  # and sorts the results.
  def flatmap_and_sort(student_school_years)
    student_school_years.map do |student_school_year|
      yield student_school_year
    end.flatten.sort_by(&:occurred_at).reverse
  end

  def serialize_student_for_profile(student)
    student.as_json.merge({
      student_risk_level: student.student_risk_level.as_json,
      absences_count: student.most_recent_school_year.absences.count,
      tardies_count: student.most_recent_school_year.tardies.count,
      school_name: student.try(:school).try(:name),
      homeroom_name: student.try(:homeroom).try(:name),
      discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count,
      restricted_notes_count: student.event_notes.where(is_restricted: true).count
    }).stringify_keys
  end

  # The feed of mutable data that changes most frequently and is owned by Student Insights.
  # restricted_notes: If false display non-restricted notes, if true display only restricted notes.
  def student_feed(student, restricted_notes: false)
    {
      event_notes: student.event_notes
        .select {|note| note.is_restricted == restricted_notes}
        .map {|event_note| serialize_event_note(event_note) },
      services: {
        active: student.services.active.map {|service| serialize_service(service) },
        discontinued: student.services.discontinued.map {|service| serialize_service(service) }
      },
      deprecated: {
        interventions: student.interventions.map { |intervention| serialize_intervention(intervention) }
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

  def set_up_sped_data
    @student = Student.find(params[:id])
    @current_educator = current_educator
    @url = root_url.chomp('/') + request.path
    @sections = (params[:sections] || "").split(/\s*,\s*/)
    

    @filter_from_date = params[:from_date] ? Date.strptime(params[:from_date],  "%m/%d/%Y") : Date.today()
    @filter_to_date = params[:from_date] ? Date.strptime(params[:to_date],  "%m/%d/%Y") : Date.today()

    school_year_ids = school_year_id_range(@filter_from_date, @filter_to_date)
    
    # Load all event notes that are NOT restricted for the student
    @event_notes = @student.event_notes.where(:is_restricted => false).where(recorded_at: @filter_from_date..@filter_to_date)

    # Load all services for the student
    @services = @student.services.includes(:discontinued_services).where(date_started: @filter_from_date..@filter_to_date)

    # Load last 2 student schools years for absences, tardies, and discipline incidents
    @student_school_years = @student.student_school_years.includes(:absences).includes(:tardies).includes(:discipline_incidents).where(school_year_id: school_year_ids)
    
    # Flatten the discipline incidents, sorted by occurrance date
    @discipline_incidents = @student_school_years.flat_map(&:discipline_incidents).sort_by(&:occurred_at).select do |hash| 
      hash[:occurred_at] >= @filter_from_date && hash[:occurred_at] <= @filter_to_date
    end


    # This is a hash with the test name as the key and an array of date-sorted student assessment objects as the value
    student_assessments_by_date = @student.student_assessments.order_by_date_taken_asc.includes(:assessment).where(date_taken: @filter_from_date..@filter_to_date)

    @student_assessments = student_assessments_by_date.each_with_object({}) do |student_assessment, hash|
      test = student_assessment.assessment
      test_name = "#{test.family} #{test.subject}"
      hash[test_name] ||= []

      result = case test.family
        when "MCAS" then student_assessment.scale_score
        when "STAR" then student_assessment.percentile_rank
        when "DIBELS" then student_assessment.performance_level
        else student_assessment.scale_score
      end


      hash[test_name].push([student_assessment.date_taken,result])
    end.sort.to_h

    @serialized_data = {
      graph_date_range: {
        filter_from_date: @filter_from_date,
        filter_to_date: @filter_to_date
      },
      attendance_data: student_profile_attendance_data(@student_school_years)
    }
  end
end
