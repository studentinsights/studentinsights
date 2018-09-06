require 'rails_helper'

RSpec.describe StarReadingImporter do

  let(:star_reading_importer) {
    described_class.new(options: {
      school_scope: nil,
      log: LogHelper::FakeLog.new
    })
  }

  describe '#import_row' do

    context 'reading file' do

      let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/fake_star_reading.csv") }
      let(:csv) { star_reading_importer.data_transformer.transform(csv_string) }
      let(:import) { csv.each_with_index { |row, index| star_reading_importer.import_row(row) } }

      context 'with good data' do
        context 'existing student' do
          let!(:student) { FactoryBot.create(:student_we_want_to_update) }
          it 'creates a new student test result' do
            expect { import }.to change { StarReadingResult.count }.by 1
          end
          it 'sets instructional reading level correctly' do
            import
            expect(StarReadingResult.last.instructional_reading_level).to eq 5.0
          end
          it 'sets date taken correctly' do
            import
            expect(StarReadingResult.last.date_taken).to eq(
              DateTime.new(2015, 1, 21, 14, 18, 27)  # DateTimes imported from CST; stored in UTC
            )
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end
        context 'student does not exist' do
          it 'does not create a new student test result' do
            expect { import }.to change { StarReadingResult.count }.by 0
          end
          it 'does not create a new student' do
            expect { import }.to change(Student, :count).by 0
          end
        end
      end

      context 'with bad data' do
        let(:csv_string) { File.read("#{Rails.root}/spec/fixtures/bad_star_reading_data.csv") }
        let(:csv) { star_reading_importer.data_transformer.transform(csv_string) }
        let!(:student) { FactoryBot.create(:student, local_id: '10') }

        it 'does not raise an error' do
          expect { import }.not_to raise_error
        end
        it 'does not import the invalid row' do
          expect { import }.to change { StarReadingResult.count }.by 0
        end
        it 'increments invalid row counter' do
          expect { import }.to change {
            star_reading_importer.instance_variable_get(:@invalid_rows_count)
          }.by 1
        end
      end

    end
  end
end
