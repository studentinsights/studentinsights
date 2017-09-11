class SchoolsController < ApplicationController
  include StudentsQueryHelper

  before_action :set_school, :authorize_for_school

  def show
    query = SchoolOverviewQuery.new(school: @school, current_educator: current_educator)

    @serialized_data = {
      students: query.merged_student_hashes,
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

end
