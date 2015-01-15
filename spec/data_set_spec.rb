require 'rails_helper'

describe DataSet do

  describe '#parse' do

    context 'when all required sheets and headers are present' do

      context 'when columns match data format correctly' do

        it 'returns true and does not raise an error' do

          well_formatted_excel = "SampleData.xlsx"
          result = DataSet.parse(well_formatted_excel)
          expect(result).to eq(true) 

        end

      end
      
      context 'when columns mismatch data format' do

        it 'raises an error' do

          format_mismatch_excel = "SampleData_formats_wrong.xlsx"
          expect { DataSet.parse(format_mismatch_excel) }.to raise_error

        end

      end

    end

    context 'when required sheets are missing' do
      
      it 'raises an error' do

        missing_sheet_excel = "SampleData_sheets_missing.xlsx"
        expect { DataSet.parse(missing_sheet_excel) }.to raise_error
    
      end

    end

    context 'when required columns are missing' do

      it 'raises an error' do

        missing_columns_excel = "SampleData_columns_missing.xlsx"
        expect { DataSet.parse(missing_columns_excel) }.to raise_error

      end

    end

  end
  
end