require 'rails_helper'

RSpec.describe StarMathImporter do

  let(:star_math_importer) do
    importer = described_class.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    })
    importer.instance_variable_set(:@invalid_rows_count, 0)
    importer
  end

  describe '#import_row' do

    context 'math fixture file' do

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
            expect(StarMathResult.last.date_taken).to eq(
              DateTime.new(2015, 1, 21, 14, 18, 27)  # DateTimes imported from CST; stored in UTC
            )
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
        let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/bad_star_math_data.csv") }
        let(:csv) { star_math_importer.data_transformer.transform(csv_string) }
        let!(:student) { FactoryBot.create(:student_we_want_to_update) }

        it 'does not raise an error' do
          expect { import }.not_to raise_error
        end
        it 'does not import the invalid row' do
          expect { import }.to change { StarMathResult.count }.by 0
        end
        it 'increments invalid row counter' do
          expect { import }.to change {
            star_math_importer.instance_variable_get(:@invalid_rows_count)
          }.by 1
        end
      end
    end

  end
end
