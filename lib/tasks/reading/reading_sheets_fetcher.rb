require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

APPLICATION_NAME = 'Student Insights'.freeze
SCOPE = [Google::Apis::DriveV3::AUTH_DRIVE_READONLY, Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY]

# Initialize the APIs

auth = Google::Auth.get_application_default(scope: SCOPE)

drive_service = Google::Apis::DriveV3::DriveService.new
drive_service.client_options.application_name = APPLICATION_NAME
drive_service.authorization = auth

sheet_service = Google::Apis::SheetsV4::SheetsService.new
sheet_service.client_options.application_name = APPLICATION_NAME
sheet_service.authorization = auth

folder_names = ["Student Insights Sync Test"]

folder_names.each do |folder|
  # Get folder ID
  selected_folder = drive_service.list_files(q: "name = '#{folder}'",
                                      fields: 'files(id, name)')
  folder_id = selected_folder.files[0].id

  # Get GIDs for all Spreadsheets in folder
  sheets_info = drive_service.list_files(q: "'#{folder_id}' in parents",
                                    fields: 'files(id, name)')

  # Get values from sheets
  sheets_info.files.each do |spreadsheet| #each spreadsheet in the folder
    sheet_service.get_spreadsheet(spreadsheet.id).sheets.each do |sheet| #each sheet in the spreadsheet
      sheet_values = sheet_service.get_spreadsheet_values(spreadsheet.id, sheet.properties.title).values
      CSV.open("#{File.dirname(__FILE__)}/csv/#{spreadsheet.name}-#{sheet.properties.title}.csv", "wb") do |csv|
        sheet_values.each do |row|
          csv << row
        end
      end
    end
  end
end
