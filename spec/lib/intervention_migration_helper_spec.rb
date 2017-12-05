require 'rails_helper'
require './lib/tasks/data_migrations/intervention_migration_helper.rb'

RSpec.describe InterventionMigrationHelper, type: :model do

  context "intervention corresponds to a service" do
    let(:helper) { InterventionMigrationHelper.new(intervention, 7) }

    let(:intervention) {
      FactoryGirl.create(
        :intervention,
        intervention_type_id: 21,
        comment: "Student's mom said she liked the idea, excellent!",
        goal: "Improve attendance."
      )
    }

    it "creates a service and an event note" do
      expect { helper.migrate }.to change(Service, :count).by 1
      expect { helper.migrate }.to change(EventNote, :count).by 1
    end

    it "creates the right service details" do
      helper.migrate
      service = Service.last

      expect(service.student_id).to eq(intervention.student_id)
      expect(service.recorded_by_educator_id).to eq(7)
      expect(service.service_type_id).to eq(502)
      expect(service.recorded_at).to eq(intervention.created_at)
      expect(service.date_started).to eq(intervention.start_date)
    end

    it "creates the right event note details" do
      helper.migrate
      event_note = EventNote.last

      expect(event_note.student_id).to eq(intervention.student_id)
      expect(event_note.educator_id).to eq(7)
      expect(event_note.event_note_type_id).to eq(304)
      expect(event_note.recorded_at).to eq(intervention.created_at)
      expect(event_note.text).to eq("Student's mom said she liked the idea, excellent!\n\nGoal: Improve attendance.")
      expect(event_note.is_restricted).to eq(true)
    end
  end

  context "intervention does not correspond to a service" do
    let(:helper) { InterventionMigrationHelper.new(intervention, 8) }

    let(:intervention) {
      FactoryGirl.create(
        :intervention,
        intervention_type_id: 25,
        comment: "Student's mom said she liked the idea, excellent!",
        goal: "Keep student engaged and excited."
      )
    }

    it "creates an event note" do
      expect { helper.migrate }.to change(Service, :count).by 0
      expect { helper.migrate }.to change(EventNote, :count).by 1
    end

    it "creates the right event note details" do
      helper.migrate
      event_note = EventNote.last

      expect(event_note.student_id).to eq(intervention.student_id)
      expect(event_note.educator_id).to eq(8)
      expect(event_note.event_note_type_id).to eq(304)
      expect(event_note.text).to eq("Student's mom said she liked the idea, excellent!\n\nGoal: Keep student engaged and excited.")
      expect(event_note.is_restricted).to eq(true)
    end
  end

end
