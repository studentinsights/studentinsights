class PagesController < ApplicationController

  def index
    @students = Student.default_sort_by_math
    @risk_categories = [ "High", "Medium", "Low" ]
  end

end
