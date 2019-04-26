require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'googleauth/stores/file_token_store'
require 'fileutils'
require 'csv'

OOB_URI = 'urn:ietf:wg:oauth:2.0:oob'.freeze
APPLICATION_NAME = 'Student Insights'.freeze
CREDENTIALS_PATH = File.expand_path('credentials.json', File.dirname(__FILE__)).freeze.freeze
# The file token.yaml stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
TOKEN_PATH = 'token.yaml'.freeze
SCOPE = [Google::Apis::DriveV3::AUTH_DRIVE_READONLY, Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY]

##
# Ensure valid credentials, either by restoring from the saved credentials
# files or intitiating an OAuth2 authorization. If authorization is required,
# the user's default browser will be launched to approve the request.
#
# @return [Google::Auth::UserRefreshCredentials] OAuth2 credentials
def authorize
  client_id = Google::Auth::ClientId.from_file(CREDENTIALS_PATH)
  token_store = Google::Auth::Stores::FileTokenStore.new(file: TOKEN_PATH)
  authorizer = Google::Auth::UserAuthorizer.new(client_id, SCOPE, token_store)
  user_id = 'default'
  credentials = authorizer.get_credentials(user_id)
  if credentials.nil?
    url = authorizer.get_authorization_url(base_url: OOB_URI)
    puts 'Open the following URL in the browser and enter the ' \
         "resulting code after authorization:\n" + url
    code = gets
    credentials = authorizer.get_and_store_credentials_from_code(
      user_id: user_id, code: code, base_url: OOB_URI
    )
  end
  credentials
end

# Initialize the APIs

drive_service = Google::Apis::DriveV3::DriveService.new
drive_service.client_options.application_name = APPLICATION_NAME
drive_service.authorization = authorize

sheet_service = Google::Apis::SheetsV4::SheetsService.new
sheet_service.client_options.application_name = APPLICATION_NAME
sheet_service.authorization = authorize

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
