require "administrate/field/base"

class HomeroomNameField < Administrate::Field::Base
  def to_s
    data.try(:name)
  end
end
