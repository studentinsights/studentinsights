
require 'rails_helper'

RSpec.describe BehaviorImporter do

  let(:importer) {
    Importer.new(current_file_importer: described_class.new)
  }

  before { FactoryGirl.create(:student, local_id: '11') }
  before { FactoryGirl.create(:student, local_id: '12') }
  before { FactoryGirl.create(:student, local_id: '13') }
  before { FactoryGirl.create(:student, local_id: '14') }

  let(:import) { importer.start_import(csv) }

  describe '#import_row' do
    context 'realistic data ("good" case), not great data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_behavior_export.txt", "r:CP1252") }  # Windows 1252
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      let!(:student_we_want_to_update) { FactoryGirl.create(:student_we_want_to_update) }

      before do |example|
        import unless example.metadata[:skip_before]
      end

      it 'does not raise errors about byte sequence, length, missing date/time values' do
        expect { import }.not_to raise_error
      end
      it 'creates new discipline incidents', skip_before: true do
        expect { import }.to change(DisciplineIncident, :count).by 4
      end

      context 'student we want to update' do
        it 'creates discipline incident for the correct student' do
          expect(student_we_want_to_update.reload.most_recent_school_year.discipline_incidents.size).to eq 1
        end
        it 'assigns the incident code correctly' do
          incident = student_we_want_to_update.reload.most_recent_school_year.discipline_incidents.last
          expect(incident.incident_code).to eq 'Hitting'
        end
      end
      context 'has exact time' do
        let(:incident_with_time_data) { Student.find_by_local_id("10").reload.most_recent_school_year.discipline_incidents.last }
        it 'sets has exact time to true' do
          expect(incident_with_time_data.has_exact_time).to eq true
        end
        it 'assigns the date and time correctly' do
          expect(incident_with_time_data.occurred_at).to eq Time.utc(2015, 10, 1, 13, 00)
        end
      end
      context 'time missing' do
        let(:incident_without_time_data) { Student.find_by_local_id("13").most_recent_school_year.discipline_incidents.last }
        it 'sets has exact time to false' do
          expect(incident_without_time_data.has_exact_time).to eq false
        end
        it 'assigns the date without a time' do
          expect(incident_without_time_data.occurred_at).to eq Time.utc(2015, 10, 3)
        end
      end
      context 'description text has non UTF-8 byte sequence' do
        let(:incident_with_non_utf8_description) { Student.find_by_local_id("12").most_recent_school_year.discipline_incidents.last }
        it 'fights back' do
          expect(incident_with_non_utf8_description.reload.incident_description).to eq("pencil that didn’t need to be")
        end
      end
    end
  end
end
