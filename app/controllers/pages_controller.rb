class PagesController < ApplicationController

  def index
    @students = Student.all.each_slice(12).to_a
  end

end
