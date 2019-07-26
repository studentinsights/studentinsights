# typed: true
require "administrate/field/base"

class HomeroomNameField < Administrate::Field::Base
  def to_s
    data.try(:name) || 'None'
  end
end
