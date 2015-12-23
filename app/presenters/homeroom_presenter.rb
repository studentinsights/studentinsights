class HomeroomPresenter < Struct.new :homeroom

  def grade
    # "08" => "8"
    # "KF" => "KF"
    return homeroom.grade if homeroom.grade.to_i == 0
    homeroom.grade.to_i.to_s
  end

end
