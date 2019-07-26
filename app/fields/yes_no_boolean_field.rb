# typed: true
require "administrate/field/base"

class YesNoBooleanField < Administrate::Field::Base
  def to_s
    if data then "yes" else "no" end
  end
end
