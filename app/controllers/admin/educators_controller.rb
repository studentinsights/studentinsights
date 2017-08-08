module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.

    def index
      @_order = Administrate::Order.new(:full_name)
      super
    end

  end
end
