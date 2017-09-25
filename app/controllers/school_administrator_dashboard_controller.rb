class SchoolAdministratorDashboardController < ApplicationController

  #Lots of duplication from SchoolsController, should probably abstract into a parent by the end

  include StudentsQueryHelper

  before_action :set_school

  def show
    active_students = students_for_dashboard(@school)

    student_hashes = log_timing('schooladministratordashboard#show student_hashes') do
      load_precomputed_student_hashes(Time.now, active_students.map(&:id))
    end

    merged_student_hashes = log_timing('schooladministratordashboard#show merge_mutable_fields_for_slicing') do
      merge_mutable_fields_for_slicing(student_hashes)
    end

    @serialized_data = {
      students: merged_student_hashes,
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  private

  # Just taking this method from the schools controller for now.
  #
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

  def set_school
    @school = School.find_by_slug(params[:id]) || School.find_by_id(params[:id])

    redirect_to root_url if @school.nil?
  end

  def students_for_dashboard(school)
    school.students.active
  end

end



