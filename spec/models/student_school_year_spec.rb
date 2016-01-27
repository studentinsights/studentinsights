require 'rails_helper'

RSpec.describe StudentSchoolYear do
  it { is_expected.to have_many(:absences) }
  it { is_expected.to have_many(:tardies) }
  it { is_expected.to have_many(:discipline_incidents) }
  it { is_expected.to have_many(:interventions) }
  it { is_expected.to have_many(:student_assessments) }
end
