require 'rails_helper'

RSpec.describe McasImporter do

  describe '#import' do
    context 'with good data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_mcas.csv") }

      context 'for Healey school' do
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:healey_importer) { McasImporter.new(school: healey) }

        it 'creates a student' do
          expect { healey_importer.import(file) }.to change(Student, :count).by 1
        end
        it 'creates an MCAS result' do
          expect { healey_importer.import(file) }.to change(McasResult, :count).by 1
        end
        it 'sets the MCAS scaled scores and performance levels correctly' do
          healey_importer.import(file)
          mcas_result = McasResult.last
          expect(mcas_result.ela_scaled).to eq(222)
          expect(mcas_result.math_scaled).to eq(214)
          expect(mcas_result.ela_performance).to eq('NI')
          expect(mcas_result.math_performance).to eq('W')
        end
        context 'some MCAS growth values are nonsense' do
          it 'sets the MCAS growth scores correctly' do
            healey_importer.import(file)
            mcas_result = McasResult.last
            expect(mcas_result.ela_growth).to eq(70)
            expect(mcas_result.math_growth).to eq(nil)
          end
        end
      end

      context 'with bad data' do
        let(:file) { File.open("#{Rails.root}/spec/fixtures/bad_mcas.csv") }
        let(:healey) { School.where(local_id: "HEA").first_or_create! }
        let(:healey_importer) { McasImporter.new(school: healey) }
        it 'raises an error' do
          expect { healey_importer.import(file) }.to raise_error ActiveRecord::StatementInvalid
        end
      end
    end
  end
end
