class ClassroomBalancingController < ApplicationController
  # This entire feature is Somerville-specific
  before_action :ensure_somerville_only!

  # The schools and grade levels that can be balanced.  This isn't an authorization
  # gate, so is more a place for adding a helpful UI suggestion than anything else.
  def available_grade_levels_json
    # schools
    default_school_id = current_educator.school_id
    school_ids_to_balance = School.where(school_type: ['ESMS', 'ES', 'MS']).map(&:id)
    schools_json = School.find(school_ids_to_balance).as_json(only: [:id, :name])

    # grade levels
    grade_levels_to_balance = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6'
    ]
    current_grade_level = current_educator.homeroom.try(:grade) || 'KF'
    default_grade_level_next_year = GradeLevels.new.next(current_grade_level)

    render json: {
      default_school_id: default_school_id,
      schools: schools_json,
      default_grade_level_next_year: default_grade_level_next_year,
      grade_levels_next_year: grade_levels_to_balance
    }
  end

  # Returns a list of students for the classroom list creator, looking at
  # a particular school and grade level.
  #
  # Authorized here is different than normal.
  def students_for_grade_level_next_year_json
    school_id = params[:school_id].to_i
    grade_level_next_year = params[:grade_level_next_year]

    # Check authorization by grade level, differently than normal.
    students = query_for_authorized_students(current_educator, school_id, grade_level_next_year)
    students_json = students.as_json({
      only: [
        :id,
        :first_name,
        :last_name,
        :date_of_birth,
        :disability,
        :program_assigned,
        :limited_english_proficiency,
        :plan_504,
        :home_language,
        :free_reduced_lunch,
        :race,
        :hispanic_latino,
        :gender,
        :most_recent_star_math_percentile,
        :most_recent_star_reading_percentile
      ],
      methods: [
        :latest_access_results,
        :latest_dibels,
        :most_recent_school_year_discipline_incidents_count
      ]
    })

    # educator names (including ones that are entered in services
    # and don't correspond directly to educator records
    educator_names_json = educator_names(school_id).as_json

    render json: {
      students: students_json,
      educator_names: educator_names_json,
      current_educator_name: current_educator.full_name
    }
  end

  # The data for a particular instance of doing classroom balancing.
  # Users are only authorized to load records they have created themselves.
  def classrooms_for_grade_json
    params.permit(:balance_id)
    balance_id = params[:balance_id]
    balancing = query_for_balancing(current_educator, balance_id)
    raise EducatorNotAuthorized if balancing.nil?

    balancing_json = serialize_as_balancing_json(balancing)
    render json: {
      classrooms_for_grade: balancing_json
    }
  end

  # For saving progress on classroom balancing.
  # This is a POST and we store all updates.
  def update_classrooms_for_grade_json
    # Rails passes these as nested under the controller and also as not nested.
    # Here we read the nested values.
    params.permit(:balance_id, :school_id, :grade_level_next_year, json: {})

    # Write a new record
    balance_id = params[:balance_id]
    classrooms_for_grade = ClassroomsForGrade.create!({
      balance_id: balance_id,
      created_by_educator_id: current_educator.id,
      school_id: params[:school_id],
      grade_level_next_year: params[:grade_level_next_year],
      json: params[:json] # left opaque for UI to iterate
    })
    balancing_json = serialize_as_balancing_json(classrooms_for_grade)
    render json: {
      classrooms_for_grade: balancing_json
    }
  end

  # Authorization is checked differently here as well with two steps:
  # - permission to view that grade for creating classrooms
  # - they've started a balancing session and are passing along that balance_id within a window
  def profile_json
    balance_id = params[:balance_id]
    student_id = params[:student_id]
    student = Student.find(student_id)
    raise Exceptions::EducatorNotAuthorized unless is_authorized_for_grade_level?(current_educator, student.school_id, student.grade)
    raise EducatorNotAuthorized if query_for_balancing(current_educator, balance_id).nil?

    # Load feed cards, but just for this student
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i
    feed = Feed.new([student])
    feed_cards = feed.all(time_now, limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  private
  def educator_names(school_id)
    school = School.find(school_id)
    [
      school.educator_names_for_services,
      Service.provider_names
    ].flatten.uniq.compact
  end

  # Check authorization for the grade level in a different way than normal
  def query_for_authorized_students(educator, school_id, grade_level_next_year)
    grade_level = GradeLevels.new.previous(grade_level_next_year)
    return [] unless is_authorized_for_grade_level?(educator, school_id, grade_level)

    # Query for those students (outside normal authorization rules)
    Student.active.where({
      school_id: school_id,
      grade: grade_level
    })
  end

  # Only let educators read their own writes
  def query_for_balancing(educator, balance_id)
    classrooms_for_grade_records = ClassroomsForGrade
      .order(created_at: :desc)
      .limit(1)
      .where({
        balance_id: balance_id,
        created_by_educator_id: educator.id
      })

    if classrooms_for_grade_records.size != 1
      nil
    else
      classrooms_for_grade_records.first
    end
  end

  def serialize_as_balancing_json(classrooms_for_grade)
    classrooms_for_grade.as_json(only: [
      :balance_id,
      :created_by_educator_id,
      :school_id,
      :grade_level_next_year,
      :json
    ])
  end

  def is_balance_for_educator?(educator, balance_id)
    ClassroomsForGrade
  end

  # This is intended only for local use in this controller and is based off
  # authorizer#is_authorized_for_student?
  def is_authorized_for_grade_level?(educator, school_id, grade_level)
    return false unless is_authorized_for_school_id?(educator, school_id)
    return true if educator.districtwide_access?
    return true if educator.schoolwide_access?
    return true if educator.admin?
    return true if educator.has_access_to_grade_levels? && grade_level.in?(educator.grade_level_access)
    return true if grade_level == educator.homeroom.try(:grade)
    false
  end

  def is_authorized_for_school_id?(educator, school_id)
    return true if educator.districtwide_access?
    return true if educator.school_id == school_id
    false
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  def ensure_somerville_only!
    district_key = PerDistrict.new.district_key
    raise Exceptions::EducatorNotAuthorized unless district_key == PerDistrict::SOMERVILLE
  end
end
