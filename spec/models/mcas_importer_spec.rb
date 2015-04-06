require 'rails_helper'

RSpec.describe McasImporter do

  describe '#import' do
    fixture_path = "#{Rails.root}/spec/fixtures/fake_mcas.csv"
    let(:healey) { FactoryGirl.create(:healey) }
    let(:brown) { FactoryGirl.create(:brown) }
    let(:importer) { McasImporter.new(fixture_path, healey, "05", Time.new(2014)) }

    context 'with good data' do

      it 'creates an assessment' do
        expect {
          importer.import
        }.to change(Assessment, :count).by(1)
      end

      it 'sets the assessment name correctly' do
        importer.import
        expect(Assessment.last.name).to eq('MCAS')
      end

      it 'creates a student' do
        expect {
          importer.import
        }.to change(Student, :count).by(1)
      end

      it 'sets the student name correctly' do
        importer.import
        expect(Student.last.first_name).to eq('Ben')
      end

      it 'sets the student demograpics correctly' do
        importer.import
        expect(Student.last.race).to eq('W')
        expect(Student.last.limited_english_proficient).to be false
        expect(Student.last.former_limited_english_proficient).to be true
      end

      it 'creates a student results' do
        expect {
          importer.import
        }.to change(StudentResult, :count).by(1)
      end

      it 'sets the student result correctly' do
        importer.import
        expect(StudentResult.last.ela_growth).to eq(19)
      end
    end
  end
end