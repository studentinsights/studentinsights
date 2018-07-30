require 'rails_helper'

RSpec.describe StarMathImporter do

  let(:star_math_importer) {
    described_class.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    })
  }

  describe '#import_row' do

    context 'math file' do

      let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_star_math.csv") }
      let(:csv) { star_math_importer.data_transformer.transform(csv_string) }
      let(:import) { csv.each_with_index { |row, index| star_math_importer.import_row(row) } }

      context 'with good data' do

        context 'existing student' do
          let!(:student) { FactoryBot.create(:student_we_want_to_update) }
          it 'creates a new student test result' do
            expect { import }.to change { StarMathResult.count }.by 1
          end
          it 'sets math percentile rank correctly' do
            import
            expect(StarMathResult.last.percentile_rank).to eq 70
          end
          it 'sets date taken correctly' do
            import
            expect(StarMathResult.last.date_taken).to eq Date.new(2015, 1, 21)
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end

        context 'student does not exist' do
          it 'does not create a new student test result' do
            expect { import }.to change { StarMathResult.count }.by 0
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end
      end

      context 'with bad data' do
        let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
        let(:csv) { star_math_importer.data_transformer.transform(csv_string) }

        it 'raises an error' do
          expect { import }.to raise_error NoMethodError
        end
      end
    end
  end
end
