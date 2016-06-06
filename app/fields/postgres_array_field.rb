require "administrate/field/base"

class PostgresArrayField < Administrate::Field::Base
  def to_s
    data_sorted_letters_first.sort.join(', ')
  end

  def data_sorted_letters_first
    data.partition { |x| x.is_a? String }.map(&:sort).flatten
  end

end
