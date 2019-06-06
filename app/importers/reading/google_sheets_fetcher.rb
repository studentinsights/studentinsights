# Returns array of CSVs from a Google Drive Folder.
# Requires a Google Service Account with read permissions for
# the folder.
#
# In Google console, create a service account as follows:
# 1. Log into Google Developer Console with the account you wish to associate with this project
# 2. Create a project
# 3. Select "Enable APIs and Services"
# 4. Search for and enable both the Drive API and Sheets API
# 5. Navigate to IAM & Admin > Service Accounts
# 6. Create a service account
# 7. Assign Role Project > Viewer
# 8. Create Key - this will provide the values used in the environment variables
# 9. Create a folder on Google Drive to group items for the script to download
# 10. Share this folder with the service account email (found on the project page or in the key in step 8)
#
# Within Student Insights:
# a. Set GOOGLE_SHEETS_SYNC_CREDENTIALS_JSON environment value (secret)
# b. Use the folder id (the last part of the folder url)

require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

class GoogleSheetsFetcher
  def get_sheets_from_folder(folder_id)
    sheet_ids = get_sheet_ids(folder_id)
    sheet_ids.files.each_with_object({}) do |spreadsheet, hash|
      hash[spreadsheet.name] = download_csvs(spreadsheet.id)
    end
  end

  def get_spreadsheet(sheet_id)
    download_csvs(sheet_id)
  end

  private
  def check_authorization
    if @auth.nil?
      set_env!
      @auth = Google::Auth.get_application_default(scope: [
        Google::Apis::DriveV3::AUTH_DRIVE_READONLY,
        Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY
      ])
    end
    @auth
  end

  # Take a single ENV JSON value and set it to what the Google client
  # expects.
  def set_env!
    json = JSON.parse(ENV['GOOGLE_SHEETS_SYNC_CREDENTIALS_JSON'])
    ENV['GOOGLE_ACCOUNT_TYPE'] = json['type']
    ENV['GOOGLE_CLIENT_EMAIL'] = json['client_email']
    ENV['GOOGLE_CLIENT_ID'] = json['client_id']
    ENV['GOOGLE_PRIVATE_KEY'] = json['private_key']
  end

  def application_name
    'Student Insights, GoogleSheetsFetcher'
  end

  # No real escaping for building this query
  def get_sheet_ids(unsafe_folder_id)
    # initialize drive API
    drive_service = Google::Apis::DriveV3::DriveService.new
    drive_service.client_options.application_name = @application_name
    drive_service.authorization = check_authorization()

    # minimal check for query injection
    raise "invalid unsafe_folder_id: #{unsafe_folder_id}" if /[^a-zA-Z0-9\-]/.match(unsafe_folder_id).present?
    q = "'#{unsafe_folder_id}' in parents"
    drive_service.list_files(q: q, fields: 'files(id, name)')
  end

  def download_csvs(sheet_id)
    #Initialize sheets API
    sheet_service = Google::Apis::SheetsV4::SheetsService.new
    sheet_service.client_options.application_name = @application_name
    sheet_service.authorization = check_authorization()

    # Get values from sheets indexed by sheet name
    sheet_service.get_spreadsheet(sheet_id).sheets.each_with_object({}) do |sheet, hash| #each sheet in the spreadsheet
      hash[sheet.properties.title] = CSV.generate do |csv|
        sheet_values = sheet_service.get_spreadsheet_values(sheet_id, sheet.properties.title).values
        sheet_values.each do |row|
          csv << row
        end
      end
    end
  end
end
