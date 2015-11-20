class StudentsController < ApplicationController

  before_action :authenticate_educator!

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new(@student)
    @chart_start = params[:chart_start] || "mcas-growth"
    @chart_data = StudentProfileChart.new(@student).chart_data
    @student_risk_level = @student.student_risk_level
    @level = @student_risk_level.level

    @student_school_years = @student.school_years.map do |sy|
      StudentSchoolYear.new(@student, sy)
    end

    interventions = @student.interventions.order(start_date: :desc)
    @serialized_interventions = serialize_interventions(interventions) 

    @progress_note = ProgressNote.new

    @roster_url = homeroom_path(@student.homeroom)
    @csv_url = student_path(@student) + ".csv"
    @student_url = student_path(@student)

    respond_to do |format|
      format.html
      format.csv { render csv: StudentProfileCsvExporter.new(@student).profile_csv_export, filename: 'export' }
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

  private
  # TODO(kr) factor out to serializer
  def serialize_interventions(interventions)
    interventions.map do |intervention|
      {
        id: intervention.id,
        name: intervention.name,
        comment: intervention.comment,
        goal: intervention.goal,
        start_date: intervention.start_date.strftime('%B %e, %Y'),
        end_date: intervention.end_date.try(:strftime, '%B %e, %Y'),
        educator_email: intervention.educator.try(:email)
      }
    end
  end
end
