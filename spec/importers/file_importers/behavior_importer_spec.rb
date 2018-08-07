require 'rails_helper'

RSpec.describe BehaviorImporter do
  let(:base_behavior_importer) {
    described_class.new(options: {
      school_scope: LoadDistrictConfig.new.schools.map { |school| school['local_id'] },
      log: LogHelper::FakeLog.new,
      skip_old_records: false
    })
  }

  let(:behavior_importer) {
    base_behavior_importer.instance_variable_set(:@skipped_from_school_filter, 0)
    base_behavior_importer.instance_variable_set(:@skipped_old_rows_count, 0)
    base_behavior_importer.instance_variable_set(:@touched_rows_count, 0)
    base_behavior_importer.instance_variable_set(:@invalid_rows_count, 0)
    base_behavior_importer
  }

  describe '#import_row' do
    let(:importer) { behavior_importer }
    before { importer.send(:import_row, row) }
    let(:incidents) { student.discipline_incidents }
    let(:incident) { incidents.last }

    context 'typical row' do
      let(:student) { FactoryBot.create(:student, local_id: '10') }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 1),
          incident_time: "13:00:00",
          incident_location: "Classroom",
          incident_description: "Hit another student.",
          school_local_id: "SHS"
        }
      }

      it 'creates discipline incident for the correct student' do
        expect(incidents.size).to eq 1
      end
      it 'assigns the incident code correctly' do
        expect(incident.incident_code).to eq 'Bullying'
      end
      it 'sets has exact time to true' do
        expect(incident.has_exact_time).to eq true
      end
      it 'assigns the date and time correctly' do
        expect(incident.occurred_at).to eq Time.utc(Time.now.year - 1, 10, 1, 13, 00)
      end
    end

    context 'multiple rows' do
      let(:student) { FactoryBot.create(:student, local_id: '10') }
      before { importer.send(:import_row, row_two) }

      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 1),
          incident_time: "13:00:00",
          incident_location: "Classroom",
          incident_description: "Hit another student.",
          school_local_id: "SHS"
        }
      }
      let(:row_two) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 2),
          incident_location: "Classroom",
          incident_description: "Hit another student again.",
          school_local_id: "SHS"
        }
      }

      it 'creates two discipline incidents' do
        expect(incidents.size).to eq 2
      end

      it 'sets the descriptions correctly' do
        descriptions = incidents.pluck(:incident_description).sort
        expect(descriptions).to eq ["Hit another student again.", "Hit another student."]
      end

    end

    context 'very long incident description' do
      let!(:student) { FactoryBot.create(:student, local_id: '11') }
      let(:big_block_of_text) { "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 1),
          incident_time: "13:00:00",
          incident_location: "Classroom",
          incident_description: big_block_of_text,
          school_local_id: "SHS"
        }
      }

      it 'assigns the description correctly' do
        expect(incident.incident_description).to eq big_block_of_text
      end

    end

    context 'time missing' do
      let!(:student) { FactoryBot.create(:student, local_id: '13') }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 3),
          incident_time: nil,
          incident_location: "Classroom",
          incident_description: "Bullied another student.",
          school_local_id: "SHS"
        }
      }

      it 'sets has exact time to false' do
        expect(incident.has_exact_time).to eq false
      end
      it 'assigns the date without a time' do
        expect(incident.occurred_at).to eq Time.utc(Time.now.year - 1, 10, 3)
      end
    end

    context 'description text has non UTF-8 byte sequence' do
      let!(:student) { FactoryBot.create(:student, local_id: '12') }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year - 1, 10, 2),
          incident_time: "13:00:00",
          incident_location: "Classroom",
          incident_description: "pencil that didn’t need to be",
          school_local_id: "SHS"
        }
      }

      it 'fights back' do
        expect(incident.reload.incident_description).to eq("pencil that didn’t need to be")
      end
    end
  end

  describe '#import' do
    let!(:pals) { TestPals.create! }

    let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_behavior_export.txt") }
    let(:transformer) { StreamingCsvTransformer.new(LogHelper::FakeLog.new) }
    let(:output) { transformer.transform(csv_string) }

    before do
      allow_any_instance_of(CsvDownloader).to receive(:get_data).and_return output
    end

    before do
      %w[10 11 13 14].each do |local_id|
        FactoryBot.create(:student, local_id: local_id)
      end
    end

    context 'no discipline records in database' do
      it 'creates three new records' do
        expect { behavior_importer.import }.to change { DisciplineIncident.count }.by 3
      end
    end

    context 'discipline incident record, within import task scope but not found in CSV' do
      let(:hea) { School.find_by_local_id('HEA') }
      let(:student) { FactoryBot.create(:student, school: hea) }
      let!(:discipline_incident) { FactoryBot.create(:discipline_incident, student: student) }
      let(:discipline_incident_id) { discipline_incident.id }

      it 'creates three new rows, but destroys record not found in CSV' do
        expect { behavior_importer.import }.to change { DisciplineIncident.count }.by 2
      end

      it 'deletes the record in scope but not found in CSV' do
        expect(DisciplineIncident.find_by_id(discipline_incident_id)).not_to be_nil
        behavior_importer.import
        expect(DisciplineIncident.find_by_id(discipline_incident_id)).to be_nil
      end
    end

    context 'discipline incident record, out of import task scope and not found in CSV' do
      let(:hea) { School.find_by_local_id('HEA') }
      let(:student) { FactoryBot.create(:student, school: hea) }
      let!(:discipline_incident) { FactoryBot.create(:discipline_incident, student: student) }
      let(:discipline_incident_id) { discipline_incident.id }

      let(:base_behavior_importer) {
        described_class.new(options: {
          school_scope: ['SHS'],  # All students in fake_behavior_export.txt are SHS
          log: LogHelper::FakeLog.new,
          skip_old_records: false
        })
      }

      it 'creates three new rows, destroys zero' do
        expect { behavior_importer.import }.to change { DisciplineIncident.count }.by 3
      end

      it 'does not delete the existing record that\'s out of scope and not found in CSV' do
        behavior_importer.import
        expect(DisciplineIncident.find_by_id(discipline_incident_id)).not_to be_nil
        behavior_importer.import
        expect(DisciplineIncident.find_by_id(discipline_incident_id)).not_to be_nil
      end
    end
  end
end
