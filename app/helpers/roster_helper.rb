module RosterHelper
  def initial_show_or_hide(class_name)
    if cookies[:columns_selected].include?(class_name)
      'show'
    else
      'hide'
    end
  end
end
