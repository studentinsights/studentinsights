require 'spec_helper'

RSpec.describe DashboardQueries do
  describe 'dashboard serialization' do
    let!(:pals) { TestPals.create! }
    let!(:student) { FactoryBot.create(:student, school: School.find_by_local_id('HEA'))}

    it '#individual_student_absence_data has expected fields' do
      json = DashboardQueries.new(pals.healey_laura_principal).send(:individual_student_absence_data, student)
      expect(json.keys.map(&:to_sym)).to contain_exactly(*[
        :absences,
        :first_name,
        :grade,
        :id,
        :last_name,
        :homeroom_label,
        :latest_note
      ])
    end

    it '#individual_student_tardies_data has expected fields' do
      json = DashboardQueries.new(pals.healey_laura_principal).send(:individual_student_tardies_data, student)
      expect(json.keys.map(&:to_sym)).to contain_exactly(*[
        :tardies,
        :first_name,
        :grade,
        :id,
        :last_name,
        :homeroom_label,
        :latest_note
      ])
    end

    it '#individual_student_discipline_data has expected fields' do
      DisciplineIncident.create!({
        student_id: student.id,
        occurred_at: Time.now
      })
      json = DashboardQueries.new(pals.healey_laura_principal).send(:individual_student_discipline_data, student)
      expect(json.keys.map(&:to_sym)).to contain_exactly(*[
        :discipline_incidents,
        :first_name,
        :grade,
        :id,
        :last_name,
        :homeroom_label,
        :latest_note
      ])
      expect(json[:discipline_incidents].first.keys).to contain_exactly(*[
        "student_id",
        "incident_code",
        "incident_location",
        "occurred_at",
        "has_exact_time"
      ])
    end
  end
end
