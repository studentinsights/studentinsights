class HomeroomsController < ApplicationController
  include StudentsQueryHelper

  def homeroom_json
    homeroom_id_or_slug = params.permit(:id)[:id]
    homeroom = authorize_and_assign_homeroom!(homeroom_id_or_slug)

    rows = eager_students(homeroom).map {|student| fat_student_hash(student) }

    # For navigation
    allowed_homerooms = current_educator.allowed_homerooms.order(:name)

    render json: {
      homeroom: homeroom.as_json({
        only: [:id, :slug, :name],
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
      homerooms: allowed_homerooms.as_json(only: [:slug, :name])
    }
  end

  private
  def eager_students(homeroom, *additional_includes)
    homeroom.students.active.includes([
      :event_notes,
      :interventions,
      :homeroom,
    ] + additional_includes)
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    HashWithIndifferentAccess.new(student_hash_for_slicing(student).merge({
      event_notes_without_restricted: student.event_notes_without_restricted,
      interventions: student.interventions,
      sped_data: student.sped_data,
    }))
  end

  def authorize_and_assign_homeroom!(homeroom_id_or_slug)
    homeroom = find_homeroom_by_id_or_slug(homeroom_id_or_slug)
    raise Exceptions::EducatorNotAuthorized unless current_educator.allowed_homerooms.include? homeroom
    homeroom
  end

  # Calling `Homeroom.friendly.find` with a string version of an id will first
  # not match on id, and will match on the name for another homeroom with that
  # same value.  Be explicit here that we match first on id and
  # then if not we look to match on the slug.
  #
  # But type coercion can lead to bugs here too, like:
  # > Homeroom.find_by_id('7-263') => #<Homeroom id: 7, name: "H-001", ... >
  # So ensure that this any id lookup is really an integer and manually convert these
  # types.
  def find_homeroom_by_id_or_slug(homeroom_id_or_slug)
    if homeroom_id_or_slug.to_i.to_s == homeroom_id_or_slug.to_s
      homeroom_id = homeroom_id_or_slug.to_i
      homeroom_by_id = Homeroom.find_by_id(homeroom_id)
      return homeroom_by_id unless homeroom_by_id.nil?
    end

    homeroom_slug = homeroom_id_or_slug.to_s
    homeroom_by_slug = Homeroom.find_by_slug(homeroom_slug)
    return homeroom_by_slug unless homeroom_by_slug.nil?

    raise ActiveRecord::RecordNotFound
  end
end
