require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

APPLICATION_NAME = 'Student Insights'.freeze
GOOGLE_APPLICATION_CREDENTIALS = File.expand_path('credentials.json', File.dirname(__FILE__)).freeze.freeze
SCOPE = [Google::Apis::DriveV3::AUTH_DRIVE_READONLY, Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY]

# Initialize the APIs

drive_service = Google::Apis::DriveV3::DriveService.new
drive_service.client_options.application_name = APPLICATION_NAME
drive_service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(json_key_io: File.open(GOOGLE_APPLICATION_CREDENTIALS),
                                                                                  scope: SCOPE)

sheet_service = Google::Apis::SheetsV4::SheetsService.new
sheet_service.client_options.application_name = APPLICATION_NAME
sheet_service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(json_key_io: File.open(GOOGLE_APPLICATION_CREDENTIALS),
                                                                                  scope: SCOPE)
# Get folder ID

folder_name = "Sheets imports"
folder = drive_service.list_files(q: "name = '#{folder_name}'",
                                    fields: 'files(id, name)')
folder_id = folder.files[0].id

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
