require 'rails_helper'
require './lib/tasks/data_migrations/intervention_migration_helper.rb'

RSpec.describe InterventionMigrationHelper, type: :model do

  context "intervention corresponds to a service" do
    let(:helper) { InterventionMigrationHelper.new(intervention, 1) }

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
  end

  context "intervention does not correspond to a service" do
    let(:helper) { InterventionMigrationHelper.new(intervention, 1) }

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
  end

end
