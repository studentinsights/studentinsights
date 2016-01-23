require 'rails_helper'

RSpec.describe EducatorsImporter do

  describe '#import_row' do
    context 'good row' do
      context 'new educator' do

        context 'non-administrator' do
          let(:row) {
            { state_id: "500", local_id: "200", full_name: "Young, Jenny" }
          }
          it 'creates an educator' do
            expect { described_class.new.import_row(row) }.to change(Educator, :count).by 1
          end
          it 'sets the attributes correctly' do
            described_class.new.import_row(row)
            educator = Educator.last
            expect(educator.full_name).to eq("Young, Jenny")
            expect(educator.state_id).to eq("500")
            expect(educator.local_id).to eq("200")
            expect(educator.admin).to eq(false)
          end
        end

        context 'with school local ID' do
          let!(:healey) { FactoryGirl.create(:healey) }
          let(:row) {
            { full_name: "Spirit, Gallant", school_local_id: "HEA" }
          }

          it 'assigns the educator to the correct school' do
            described_class.new.import_row(row)
            educator = Educator.last
            expect(educator.school).to eq(healey)
          end
        end

        context 'administrator' do
          let(:row) {
            { local_id: "300", full_name: "Hill, Marian", staff_type: "Administrator" }
          }

          it 'sets the administrator attribute correctly' do
            described_class.new.import_row(row)
            educator = Educator.last
            expect(educator.admin).to eq(true)
          end
        end

      end

      context 'educator already exists' do
        let!(:educator) { FactoryGirl.create(:educator, :local_id_200) }

        let(:row) {
          { state_id: "500", local_id: "200", full_name: "Young, Jenny" }
        }

        it 'does not create an educator' do
          expect { described_class.new.import_row(row) }.to change(Educator, :count).by 0
        end
        it 'updates the educator attributes' do
          described_class.new.import_row(row)
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
          described_class.new.import_row(row)
          expect(Educator.last.homeroom).to eq homeroom
        end
      end

      context 'name of homeroom that does not exist' do
        it 'raises an error' do
          expect { described_class.new.import_row(row) }.to raise_error ActiveRecord::RecordNotFound
        end
      end
    end
  end
end
