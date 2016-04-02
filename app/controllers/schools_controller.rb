class SchoolsController < ApplicationController
  include SerializeDataHelper
  before_action :authenticate_educator!,
                :authorize

  def show
    authorized_students = current_educator.students_for_school_overview
    
    # TODO(kr) Read from cache, since this only updates daily
    student_hashes = authorized_students.map do |student|
      HashWithIndifferentAccess.new(student_hash_for_slicing(student))
    end

    # Read data stored StudentInsights each time, with no caching
    merged_student_hashes = merge_mutable_fields_for_slicing(student_hashes)

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

  private

  def serialized_data_for_star
    authorized_students = current_educator.students_for_school_overview(:student_assessments)

    # TODO(kr) Read from cache, since this only updates daily
    student_hashes = authorized_students.map do |student|
      student_hash = HashWithIndifferentAccess.new(student_hash_for_slicing(student))
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
      service_types_index: service_types_index,
      event_note_types_index: event_note_types_index
    }
  end

  # Queries for Services and EventNotes for each student, and merges the results
  # into the list of student hashes.
  def student_hash_for_slicing(student)
    student.as_json.merge({
      student_risk_level: student.student_risk_level.as_json,
      discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count,
      absences_count: student.most_recent_school_year.absences.count,
      tardies_count: student.most_recent_school_year.tardies.count,
      homeroom_name: student.try(:homeroom).try(:name)
    })
  end

  def merge_mutable_fields_for_slicing(student_hashes)
    student_ids = student_hashes.map {|student_hash| student_hash[:id] }
    all_event_notes = EventNote.where(student_id: student_ids)
    all_services = Service.active.where(student_id: student_ids)
    all_interventions = Intervention.where(student_id: student_ids)

    student_hashes.map do |student_hash|
      student_hash.merge({
        event_notes: all_event_notes.select {|event_note| event_note.student_id == student_hash[:id] },
        services: all_services.select {|service| service.student_id == student_hash[:id] },
        interventions: all_interventions.select {|intervention| intervention.student_id == student_hash[:id] }
      })
    end
  end

  def authorize
    redirect_to(homepage_path_for_current_educator) unless current_educator.schoolwide_access? ||
                                                           current_educator.has_access_to_grade_levels?

    if current_educator.has_access_to_grade_levels?
      grade_message = " Showing students in grades #{current_educator.grade_level_access.to_sentence}."
      flash[:notice] << grade_message if flash[:notice]
    end
  end
end
