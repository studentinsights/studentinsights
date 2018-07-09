require 'rails_helper'

RSpec.describe BehaviorImporter do

  let(:base_behavior_importer) {
    described_class.new(options: {
      school_scope: nil, log: nil, skip_old_records: false
    })
  }

  let(:behavior_importer) {
    base_behavior_importer.instance_variable_set(:@success_count, 0)
    base_behavior_importer.instance_variable_set(:@error_list, [])
    base_behavior_importer
  }

  describe '#import_row' do

    let(:importer) { behavior_importer }
    before { importer.import_row(row) }
    let(:incidents) { student.discipline_incidents }
    let(:incident) { incidents.last }

    context 'typical row' do
      let(:student) { FactoryBot.create(:student, local_id: '10') }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year, 10, 1),
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
        expect(incident.occurred_at).to eq Time.utc(Time.now.year, 10, 1, 13, 00)
      end
    end

    context 'multiple rows' do
      let(:student) { FactoryBot.create(:student, local_id: '10') }
      before { importer.import_row(row_two) }

      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year, 10, 1),
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
          event_date: Date.new(Time.now.year, 10, 2),
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
          event_date: Date.new(Time.now.year, 10, 1),
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
          event_date: Date.new(Time.now.year, 10, 3),
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
        expect(incident.occurred_at).to eq Time.utc(Time.now.year, 10, 3)
      end
    end

    context 'description text has non UTF-8 byte sequence' do
      let!(:student) { FactoryBot.create(:student, local_id: '12') }
      let(:row) {
        {
          local_id: student.local_id,
          incident_code: "Bullying",
          event_date: Date.new(Time.now.year, 10, 2),
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
end
