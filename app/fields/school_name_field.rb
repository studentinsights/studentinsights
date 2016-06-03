require "administrate/field/base"

class SchoolNameField < Administrate::Field::Base
  def to_s
    data.try(:local_id) || data.try(:name)
  end
end
