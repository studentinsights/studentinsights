class RoomsController < ApplicationController

  def names
    @names = Room.all.map { |r| r.name }
    render json: @names
  end

end
