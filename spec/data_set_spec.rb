require 'rails_helper'

describe DataSet do

  describe '#process' do

    context 'when all required sheets and headers are present' do

      context 'when columns match data format correctly' do

        well_formatted_excel_path = "./SampleData/SampleData.xlsx"

      end
      
      context 'when columns mismatch data format' do

        format_mismatch_excel_path = "./SampleData/SampleData_formats_wrong.xlsx"

      end

    end

    context 'when required sheets are missing' do
      
      missing_sheet_excel_path = "./SampleData/SampleData_sheets_missing.xlsx"
    
    end

    context 'when required columns are missing' do

      missing_columns_excel_path = "./SampleData/SampleData_columns_missing.xlsx"

    end

  end
  
end