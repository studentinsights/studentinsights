class SchoolsController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school, :authorize_for_school

  def show
    authorized_students = authorized_students_for_overview(@school)

    student_hashes = log_timing('schools#show student_hashes') do
      load_precomputed_student_hashes(Time.now, authorized_students.map(&:id))
    end

    merged_student_hashes = log_timing('schools#show merge_mutable_fields_for_slicing') do
      merge_mutable_fields_for_slicing(student_hashes)
    end

    @serialized_data = {
      students: merged_student_hashes,
      current_educator: current_educator,
      constant_indexes: constant_indexes
    }
    render 'shared/serialized_data'
  end

  def star_math
    serialized_data_for_star {|student| student.star_math_results }
    render 'shared/serialized_data'
  end

  def star_reading
    serialized_data_for_star {|student| student.star_reading_results }
    render 'shared/serialized_data'
  end

  def csv
    authorized_students = @school.students.active
    csv_string = StudentsSpreadsheet.new.csv_string(authorized_students)
    filename = "#{@school.name} - Exported #{Time.now.strftime("%Y-%m-%d")}.csv"
    send_data(csv_string, {
      type: Mime[:csv],
      disposition: "attachment; filename='#{filename}"
    })
  end

  private

  # This should always find a record, but if it doesn't we fall back to the
  # raw query.
  # Results an array of student_hashes.
  def load_precomputed_student_hashes(time_now, authorized_student_ids)
    begin
      # the precompute job runs at 8am UTC, and takes a few minutes to run,
      # so keep a buffer that makes sure the import task and precompute job
      # can finish before cutting over to the next day.
      query_time = time_now - 9.hours
      key = PrecomputedQueryDoc.precomputed_student_hashes_key(query_time, authorized_student_ids)
      logger.warn "load_precomputed_student_hashes querying key: #{key}..."
      doc = PrecomputedQueryDoc.find_by_key(key)
      return parse_hashes_from_doc(doc) unless doc.nil?
    rescue ActiveRecord::StatementInvalid => err
      logger.error "load_precomputed_student_hashes raised error #{err.inspect}"
    end

    # Fallback to performing the full query if something went wrong reading the
    # precomputed value
    logger.error "falling back to full load_precomputed_student_hashes query for key: #{key}"
    authorized_students = Student.find(authorized_student_ids)
    authorized_students.map {|student| student_hash_for_slicing(student) }
  end

  def parse_hashes_from_doc(doc)
    JSON.parse(doc.json).deep_symbolize_keys![:student_hashes]
  end

  def serialized_data_for_star
    authorized_students = current_educator.students_for_school_overview(:student_assessments)

    # TODO(kr) Read from cache, since this only updates daily
    student_hashes = authorized_students.map do |student|
      student_hash = student_hash_for_slicing(student)
      student_hash.merge(star_results: yield(student))
    end

    # Read data stored StudentInsights each time, with no caching
    merged_student_hashes = merge_mutable_fields_for_slicing(student_hashes)

    @serialized_data = {
      students_with_star_results: merged_student_hashes,
      current_educator: current_educator,
      constant_indexes: constant_indexes
    }
  end

  # Serialize what are essentially constants stored in the database down
  # to the UI so it can use them for joins.
  def constant_indexes
    {
      service_types_index: ServiceSerializer.service_types_index,
      event_note_types_index: EventNoteSerializer.event_note_types_index
    }
  end

  def authorize_for_school
    unless current_educator.is_authorized_for_school(@school)
      redirect_to(homepage_path_for_current_educator)
    end

    if current_educator.has_access_to_grade_levels?
      grade_message = " Showing students in grades #{current_educator.grade_level_access.to_sentence}."
      flash[:notice] << grade_message if flash[:notice]
    end
  end

  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])

    redirect_to root_url if @school.nil?
  end

  def authorized_students_for_overview(school)
    if current_educator.districtwide_access?
      school.students.active
    else
      current_educator.students_for_school_overview
    end
  end
end
