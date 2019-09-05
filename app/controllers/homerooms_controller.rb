class HomeroomsController < ApplicationController
  def homeroom_json
    homeroom_id = params.permit(:id)[:id]
    homeroom = authorize_and_assign_homeroom!(homeroom_id)

    rows = authorized_students(homeroom).map {|student| fat_student_hash(student) }

    # For navigation
    allowed_homerooms = authorized_homerooms().sort_by(&:name)

    render json: {
      homeroom: homeroom.as_json({
        only: [:id, :name],
        include: {
          educator: {
            only: [:id, :email, :full_name]
          },
          school: {
            only: [:id, :name, :school_type]
          }
        }
      }),
      rows: rows,
      homerooms: allowed_homerooms.as_json(only: [:id, :name])
    }
  end

  private
  def authorize_and_assign_homeroom!(homeroom_id)
    homeroom = find_homeroom_by_id(homeroom_id)
    raise Exceptions::EducatorNotAuthorized unless authorized_homerooms().include? homeroom
    homeroom
  end

  # Migrating this to `authorizer#homerooms`
  def authorized_homerooms
    if EnvironmentVariable.is_true('ENABLE_HOMEROOM_AUTHORIZATION_V2')
      authorizer.homerooms
    else
      authorizer.allowed_homerooms_DEPRECATED(acknowledge_deprecation: true)
    end
  end

  def authorized_students(homeroom)
    authorized do
      homeroom.students.active.includes(:event_notes, :interventions, :homeroom)
    end
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    HashWithIndifferentAccess.new(student.as_json({
      except: [
        :primary_phone,
        :primary_email,
        :student_address
      ]
    }).merge({
      has_photo: student.has_photo,
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      homeroom_name: student.try(:homeroom).try(:name),
      event_notes_without_restricted: student.event_notes_without_restricted,
      interventions: student.interventions,
      sped_data: sped_data(student)
    }))
  end

  # This only matches on homeroom_id, not `slug`, since this has led to bugs from
  # type coercion and from collisions on ids and slugs.  Works around FriendlyId,
  # which we should move away from.
  #
  # Type coercion can lead to bugs like:
  # > Homeroom.find_by_id('7-263') => #<Homeroom id: 7, name: "H-001", ... >
  # So ensure that this any id lookup is really an integer and manually convert these
  # types.
  #
  # See https://github.com/studentinsights/studentinsights/pull/2588 for more.
  def find_homeroom_by_id(homeroom_id)
    strict_homeroom_id = homeroom_id.to_i.to_s.to_i
    if homeroom_id.to_s == strict_homeroom_id.to_s
      homeroom = Homeroom.find_by_id(strict_homeroom_id) # FriendlyId patches #find, so this is more explicit
      return homeroom if homeroom.present? && homeroom.id == strict_homeroom_id
    end
    raise ActiveRecord::RecordNotFound
  end

  # SpEd Data as defined by Somerville Schools
  def sped_data(student)
    {
      sped_level: sped_level(student),
      sped_tooltip_message: sped_tooltip_message(student),
      sped_bubble_class: sped_bubble_class(student)
    }
  end

  def sped_level(student)
    case student.sped_level_of_need
    when "Low < 2"
      "1"
    when "Low >= 2"
      "2"
    when "Moderate"
      "3"
    when "High"
      "4"
    else
      "—" # long hyphen
    end
  end

  def sped_tooltip_message(student)
    case sped_level(student)
    when "1"
      "#{student.first_name} receives 0-2 hours of special education services per week."
    when "2"
      "#{student.first_name} receives 2-5 hours of special education services per week."
    when "3"
      "#{student.first_name} receives 6-14 hours of special education services per week."
    when "4"
      "#{student.first_name} receives 15+ hours of special education services per week."
    else
      nil
    end
  end

  def sped_bubble_class(student)
    case sped_level(student)
    when '—' # long hyphen
      ''
    else
      'HomeroomTable-warning-bubble HomeroomTable-sped-risk-bubble tooltip'
    end
  end
end
