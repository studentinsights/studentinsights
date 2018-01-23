class ServiceTypesController < ApplicationController
  # Used to supply valid service type names to the service upload page.

  # Authentication by default inherited from ApplicationController.

  def index
    render json: ServiceType.pluck(:name).sort
  end

  def is_service_working
    attendance_officer = ServiceType.find(502)
    student_ids = attendance_officer.services.map(&:student_ids)

    student_names_and_chart_data = student_ids.map |id|
      student = Student.find(id)

      {
        name: "#{student.first_name} #{student.last_name}",
        chart_data: StudentProfileChart.new(student).chart_data
      }
    end
  end

end
