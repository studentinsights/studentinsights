require "administrate/field/base"

class SchoolNameField < Administrate::Field::Base
  def to_s
    return 'None' unless data

    school = School.find(data)

    school.try(:name) || school.try(:local_id)
  end
end
