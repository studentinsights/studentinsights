class PagesController < ApplicationController

  def index
    @students = Student.sort_by_math_risk
    @risk_categories = [ "High", "Medium", "Low" ]
  end

end
