class SchoolLocalIdToAppId
  include Singleton

  attr_accessor :ids_dictionary

  def initialize
    @ids_dictionary = School.all.map { |school| [school.local_id, school.id] }.to_h
  end

end
