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
#
# Within Student Insights:
# a. Set GOOGLE_SHEETS_SYNC_CREDENTIALS_JSON environment value (secret)
# b. Use the folder id (the last part of the folder url)

# In Google drive, have district project lead:
# a. Share document with service account (ends with .iam.gserviceaccount.com)

require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

class GoogleSheetsFetcher
  # list of tabs [{sheet_name, tab_name, csv}]
  def get_tabs_list_from_folder(folder_id)
    sheets_map = get_sheets_from_folder(folder_id)

    tabs = []
    sheets_map.each do |sheet_name, csvs|
      csvs.each do |tab_name, csv|
        tabs << Tab.new(sheet_name, tab_name, csv)
      end
    end
  end

  # map of {spreadsheet_name => {tab_name => csv}}
  def get_sheets_from_folder(folder_id)
    sheet_ids = get_sheet_ids(folder_id)
    sheet_ids.files.each_with_object({}) do |spreadsheet, hash|
      hash[spreadsheet.name] = get_spreadsheet(spreadsheet.id)
    end
  end

  # map of {tab_name => csv}
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
    csvs = []
    spreadsheet = sheet_service.get_spreadsheet(sheet_id)
    spreadsheet.sheets.each_with_object({}) do |sheet, hash| #each sheet in the spreadsheet
      csv_string = CSV.generate do |csv|
        sheet_values = sheet_service.get_spreadsheet_values(sheet_id, sheet.properties.title).values
        sheet_values.each do |row|
          csv << row
        end
      end
      csvs << Tab.new({
        sheet_name: spreadsheet.name,
        sheet_url: spreadsheet.human_url,
        tab_name: sheet.properties.title,
        csv: csv_string
      })
    end
  end

  class Tab < Struct.new :sheet_name, :tab_name, :csv
  end
end
