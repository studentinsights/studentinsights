class ClassroomBalancingController < ApplicationController
  # This entire feature is Somerville-specific
  before_action :ensure_somerville_only!

  # The schools and grade levels that can be balanced.  This isn't an authorization
  # gate, so is more a place for adding a helpful UI suggestion than anything else.
  def available_grade_levels_json
    params.require(:balance_id)

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
  # a particular school and grade level.  Includes data needed for inline
  # profile, except for notes and services (see #profile_json).
  #
  # Authorized here is different than normal.
  def students_for_grade_level_next_year_json
    params.require(:balance_id)
    params.require(:school_id)
    params.require(:grade_level_next_year)
    school_id = params[:school_id].to_i
    grade_level_next_year = params[:grade_level_next_year]

    # Check authorization by grade level, differently than normal.
    students = classroom_balancing.authorized_students(school_id, grade_level_next_year)
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
        :iep_document,
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
    params.require(:balance_id)
    balance_id = params[:balance_id]
    balancing = classroom_balancing.authorized_balancing(balance_id)
    raise Exceptions::EducatorNotAuthorized if balancing.nil?

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
    params.require(:balance_id)
    params.require(:school_id)
    params.require(:grade_level_next_year)
    params.require(:json)
    balance_id = params[:balance_id]
    school_id = params[:school_id].to_i
    grade_level_next_year = params[:grade_level_next_year]
    json = params[:json]

    # Check that they are authorized for grade level
    grade_level_now = GradeLevels.new.previous(grade_level_next_year)
    raise Exceptions::EducatorNotAuthorized unless classroom_balancing.is_authorized_for_grade_level_now?(school_id, grade_level_now)

    # Write a new record
    classrooms_for_grade = ClassroomsForGrade.create!({
      balance_id: balance_id,
      created_by_educator_id: current_educator.id,
      school_id: school_id,
      grade_level_next_year: grade_level_next_year,
      json: json # left opaque for UI to iterate
    })
    balancing_json = serialize_as_balancing_json(classrooms_for_grade)
    render json: {
      classrooms_for_grade: balancing_json
    }
  end

  # Shows student profile information beyond what's used in classroom balancing.
  # Authorization is checked differently here, and is more permissive than the
  # standard approach but with log trails to see that they're in the balancing process.
  def profile_json
    params.require(:balance_id)
    params.require(:student_id)
    params.require(:time_now)
    params.require(:limit)
    balance_id = params[:balance_id]
    student_id = params[:student_id].to_i

    # Check that the educator is authorized to see the grade and school for this student
    student = Student.find(student_id)
    raise Exceptions::EducatorNotAuthorized unless classroom_balancing.is_authorized_for_grade_level_now?(student.school_id, student.grade)

    # Check that they gave a valid balance_id for the session, and that it matches
    # the school and grade level for the student they're asking about.
    balancing = classroom_balancing.authorized_balancing(balance_id)
    raise Exceptions::EducatorNotAuthorized if balancing.nil?
    raise Exceptions::EducatorNotAuthorized if balancing.school_id != student.school_id
    raise Exceptions::EducatorNotAuthorized if balancing.grade_level_next_year != GradeLevels.new.next(student.grade)

    # Load feed cards just for this student
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i
    feed = Feed.new([student])
    feed_cards = feed.all_cards(time_now, limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  private
  def classroom_balancing
    @classroom_balancing = ClassroomBalancing.new(current_educator)
  end

  def educator_names(school_id)
    school = School.find(school_id)
    [
      school.educator_names_for_services,
      Service.provider_names
    ].flatten.uniq.compact
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
