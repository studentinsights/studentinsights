require 'rails_helper'

RSpec.describe DataFlow do
  it 'can describe other data flows through importers that are not included in main import task (eg, FileImporterOptions)' do
    data_flows = [
      BedfordTeacherTransitionImporter.data_flow,
      BedfordDavisTransitionNotesImporter.data_flow,
      BedfordDavisSocialEmotionalImporter.data_flow,
      BedfordDavisServicesImporter.data_flow
    ]
    expect(data_flows.size).to eq(4)
    sorted_json = data_flows.as_json.sort_by {|j| j['importer'] }
    fixture_json = JSON.parse(IO.read("#{Rails.root}/spec/importers/helpers/data_flows_for_other_importers.json"))
    expect(sorted_json).to eq(fixture_json)
  end
end
