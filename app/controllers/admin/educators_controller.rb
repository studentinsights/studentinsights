module Admin
  class EducatorsController < Admin::ApplicationController
    # To customize the behavior of this controller,
    # simply overwrite any of the RESTful actions.

    def index
      @_order = Administrate::Order.new(:full_name)
      super
    end

    # Define a custom finder by overriding the `find_resource` method:
    # def find_resource(param)
    #   Educator.find_by!(slug: param)
    # end

    # See https://administrate-docs.herokuapp.com/customizing_controller_actions
    # for more information
  end
end
