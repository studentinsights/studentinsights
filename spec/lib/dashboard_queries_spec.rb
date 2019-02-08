require 'spec_helper'

RSpec.describe DashboardQueries do
  describe 'dashboard serialization' do
    let!(:pals) { TestPals.create! }
    let!(:student) { FactoryBot.create(:student, school: pals.healey)}

    def create_recent_absence!(student_id)
      Absence.create!({
        student_id: student_id,
        occurred_at: Time.now - 4.days,
        excused: false,
        dismissed: false
      })
    end

    def create_recent_discipline_incident!(student_id)
      DisciplineIncident.create!({
        student_id: student_id,
        occurred_at: Time.now - 4.days,
        incident_code: "Cell Phone Use",
        incident_location: "Classroom",
        has_exact_time: true
      })
    end

    it '#absence_dashboard_data shape of data' do
      json = DashboardQueries.new(pals.healey_laura_principal).absence_dashboard_data(pals.healey)
      expect(json.keys.map(&:to_sym)).to contain_exactly(:students_with_events, :school)
    end

    it '#absence_dashboard_data has expected fields' do
      create_recent_absence!(pals.healey.students.first.id)
      json = DashboardQueries.new(pals.healey_laura_principal).absence_dashboard_data(pals.healey)
      expect(json[:students_with_events].size).to eq pals.healey.students.size
      expect(json[:students_with_events].first.keys.map(&:to_sym)).to contain_exactly(*[
        :absences,
        :first_name,
        :grade,
        :house,
        :counselor,
        :homeroom_label,
        :id,
        :local_id,
        :last_name,
        :latest_note
      ])

      absences_in_response_json = json[:students_with_events].map {|student| student[:absences] }
      expect(absences_in_response_json.flatten.first.keys.map(&:to_sym)).to contain_exactly(*[
        :occurred_at,
        :student_id,
        :dismissed,
        :excused
      ])
    end

    it '#tardies_dashboard_data shape of data' do
      json = DashboardQueries.new(pals.healey_laura_principal).tardies_dashboard_data(pals.healey)
      expect(json.keys.map(&:to_sym)).to contain_exactly(:students_with_events, :school)
    end

    it '#discipline_dashboard_data shape of data' do
      json = DashboardQueries.new(pals.healey_laura_principal).discipline_dashboard_data(pals.healey)
      expect(json.keys.map(&:to_sym)).to contain_exactly(:students_with_events, :school)
    end

    it '#individual_student_tardies_data has expected fields' do
      json = DashboardQueries.new(pals.healey_laura_principal).send(:individual_student_tardies_data, student)
      expect(json.keys.map(&:to_sym)).to contain_exactly(*[
        :tardies,
        :first_name,
        :grade,
        :house,
        :counselor,
        :id,
        :last_name,
        :homeroom_label,
        :latest_note
      ])
    end

    it '#discipline_dashboard_data has expected fields' do
      create_recent_discipline_incident!(pals.healey.students.first.id)
      json = DashboardQueries.new(pals.healey_laura_principal).discipline_dashboard_data(pals.healey)
      expect(json[:students_with_events].size).to eq pals.healey.students.size
      expect(json[:students_with_events].first.keys.map(&:to_sym)).to contain_exactly(*[
        :discipline_incidents,
        :first_name,
        :grade,
        :house,
        :counselor,
        :homeroom_label,
        :id,
        :local_id,
        :last_name,
        :latest_note
      ])

      discipline_incidents_in_response_json = json[:students_with_events].map {|student| student[:discipline_incidents] }
      expect(discipline_incidents_in_response_json.flatten.first.keys.map(&:to_sym)).to contain_exactly(*[
        :student_id,
        :incident_code,
        :incident_location,
        :has_exact_time,
        :occurred_at
      ])
    end
  end
end
