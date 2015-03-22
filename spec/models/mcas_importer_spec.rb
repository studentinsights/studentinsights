require 'rails_helper'

RSpec.describe McasImporter do

  describe '#import' do
    fixture_path = "#{Rails.root}/spec/fixtures/fake_mcas.csv"
    let(:healey) { FactoryGirl.create(:healey) }
    let(:brown) { FactoryGirl.create(:brown) }
    let(:importer) { McasImporter.new(fixture_path, healey, "05") }

    context 'with good data' do

      it 'creates a student' do
        expect {
          importer.import
        }.to change(Student, :count).by(1)
      end

      it 'sets the student name correctly' do
        importer.import
        expect(Student.last.first_name).to eq('Ben')
      end
    end
  end
end