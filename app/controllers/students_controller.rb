class StudentsController < ApplicationController

  before_action :authenticate_educator!

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new(@student)

    @serialized_student_data = {
      student: @student,
      star_math_results: @student.star_math_results,
      star_reading_results: @student.star_reading_results,
      mcas_math_results: @student.mcas_math_results,
      mcas_ela_results: @student.mcas_ela_results,
      attendance_events_by_school_year: @student.attendance_events_by_school_year,
      discipline_incidents_by_school_year: @student.discipline_incidents_by_school_year,
      attendance_events_school_years: @student.attendance_events_school_years,
      behavior_events_school_years: @student.behavior_events_school_years
    }

    @chart_start = params[:chart_start] || "mcas-growth"
    @chart_data = StudentProfileChart.new(@serialized_student_data).chart_data

    @student_risk_level = @student.student_risk_level
    @level = @student_risk_level.level

    @student_school_years = @student.student_school_years.includes(
      :attendance_events,
      :discipline_incidents,
      :student_assessments,
      :interventions
    )

    @intervention = Intervention.new
    @interventions = @student.interventions.order(start_date: :desc)
    @progress_note = ProgressNote.new

    @roster_url = homeroom_path(@student.homeroom)
    @csv_url = student_path(@student) + ".csv"
    @student_url = student_path(@student)

    respond_to do |format|
      format.html
      format.csv {
        render csv: StudentProfileCsvExporter.new(@serialized_student_data).profile_csv_export,
        filename: 'export'
      }
      format.pdf { render text: PDFKit.new(@student_url).to_pdf }
    end
  end

  def names
    @q = params[:q].upcase
    @length = @q.length
    @matches = Student.all.select do |s|
      first_name = s.first_name[0..@length - 1].upcase if s.first_name.present?
      last_name = s.last_name[0..@length - 1].upcase if s.last_name.present?
      first_name == @q || last_name == @q
    end
    @result = @matches.map do |m|
      {
        label: StudentPresenter.new(m).full_name,
        value: m.id
      }
    end
    respond_to do |format|
      format.json { render json: @result }
    end
  end

end
