require 'rails_helper'

RSpec.describe McasImporter do

  describe '#import' do
    fixture_path = "#{Rails.root}/spec/fixtures/fake_mcas.csv"
    let(:healey) { FactoryGirl.create(:healey) }
    let(:brown) { FactoryGirl.create(:brown) }
    let(:healey_importer) { McasImporter.new(fixture_path, healey, "05") }
    let(:brown_importer) { McasImporter.new(fixture_path, brown, "05") }

    context 'with good data' do

      context 'for Healey school' do

        it 'creates a student' do
          expect {
            healey_importer.import
          }.to change(Student, :count).by(1)
        end

        it 'imports a Healey student' do
          healey_importer.import
          expect(Student.last.first_name).to eq('Ben')
        end
      end

      context 'for Brown school' do

        it 'imports a Brown student' do
          brown_importer.import
          expect(Student.last.first_name).to eq('Mari')
        end
      end
    end
  end
end