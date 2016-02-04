class SchoolsController < ApplicationController

  before_action :authenticate_admin!      # Defined in ApplicationController.

  def show
    @serialized_data = {
      students: SchoolStudentPresenter.from_students.map(&:as_json),
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end

  def star_reading
    @serialized_data = {
      students_with_star_reading: SchoolStudentPresenter.from_students(:student_assessments).map(&:as_json_with_star_reading),
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end
end
