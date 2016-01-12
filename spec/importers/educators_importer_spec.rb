require 'rails_helper'

RSpec.describe EducatorsImporter do
  let(:importer) { described_class.new }

  describe '#import_row' do
    context 'good row' do
      let(:row) {
        { state_id: "500", local_id: "200", full_name: "Young, Jenny" }
      }
      context 'new educator' do
        it 'creates an educator' do
          expect { importer.import_row(row) }.to change(Educator, :count).by 1
        end
        it 'sets the attributes correctly' do
          importer.import_row(row)
          educator = Educator.last
          expect(educator.full_name).to eq("Young, Jenny")
          expect(educator.state_id).to eq("500")
          expect(educator.local_id).to eq("200")
        end
      end

      context 'educator already exists' do
        let!(:educator) { FactoryGirl.create(:educator, :local_id_200) }
        it 'does not create an educator' do
          expect { importer.import_row(row) }.to change(Educator, :count).by 0
        end
        it 'updates the educator attributes' do
          importer.import_row(row)
          educator = Educator.last
          expect(educator.full_name).to eq("Young, Jenny")
          expect(educator.state_id).to eq("500")
        end
      end
    end
  end

  describe '#update_homeroom' do

    context 'row with homeroom name' do
      let(:row) {
        { state_id: "500", local_id: "200", full_name: "Young, Jenny", homeroom: "HEA 100" }
      }

      context 'name of homeroom that exists' do
        let!(:homeroom) { FactoryGirl.create(:homeroom, :named_hea_100) }
        it 'assigns the homeroom tho the educator' do
          importer.import_row(row)
          expect(Educator.last.homeroom).to eq homeroom
        end
      end

      context 'name of homeroom that does not exist' do
        it 'raises an error' do
          expect { importer.import_row(row) }.to raise_error ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
