require 'rails_helper'

RSpec.describe McasImporter do

  describe '#import' do
    fixture_path = "#{Rails.root}/spec/fixtures/fake_mcas.csv"
    let(:healey) { FactoryGirl.create(:healey) }
    let(:brown) { FactoryGirl.create(:brown) }
    let(:healey_importer) { McasImporter.new(fixture_path, healey, "05") }
    let(:brown_importer) { McasImporter.new(fixture_path, brown, "05") }

    context 'with good data' do

      it 'creates an assessment' do
        expect {
          healey_importer.import
        }.to change(Assessment, :count).by(1)
      end

      it 'sets the assessment name correctly' do
        healey_importer.import
        expect(Assessment.last.name).to eq('MCAS')
      end

      context 'for Healey school' do

        it 'creates a student' do
          expect {
            healey_importer.import
          }.to change(Student, :count).by(1)
        end

        it 'imports a Healey student' do
          healey_importer.import
          expect(Student.last.state_identifier).to eq('000222')
        end

        it 'sets the student demograpics correctly' do
          healey_importer.import
          expect(Student.last.race).to eq('W')
          expect(Student.last.limited_english_proficient).to be false
          expect(Student.last.former_limited_english_proficient).to be true
        end

        it 'creates a student result' do
          expect {
            healey_importer.import
          }.to change(McasResult, :count).by(1)
        end

        it 'sets the student result correctly' do
          healey_importer.import
          expect(McasResult.last.ela_growth).to eq(19)
        end
      end

      context 'for Brown school' do

        it 'imports a Brown student' do
          brown_importer.import
          expect(Student.last.state_identifier).to eq('000223')
        end
        
      end
    end
  end
end