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
  # returns [Tab]
  # optionally recur into folders with recursive: true
  # Note that this may hit API quotas, and this class
  # doesn't batch http requests.
  def get_tabs_from_folder(folder_id, options = {})
    puts "get_tabs_from_folder(#{folder_id})"
    sheets = list_sheets(folder_id)

    tabs = []
    sheets.files.each do |file|
      tabs += get_tabs_from_sheet(file.id)
    end

    # Google Drive isn't actually a folder system,
    # so this recurs manually since the number of files is small.
    # See https://stackoverflow.com/questions/41741520/how-do-i-search-sub-folders-and-sub-sub-folders-in-google-drive
    # for more on how Drive works, or the `batch` method in 
    # the Ruby API for alternatives.
    if options.fetch(:recursive, false)
      sub_folders = list_folders(folder_id)
      sub_folders.files.each do |sub_folder|
        tabs += get_tabs_from_folder(sub_folder.id, options)
      end
    end

    tabs
  end

  # returns [Tab]
  def get_tabs_from_sheet(sheet_id)
    download_tab_csvs_batched(sheet_id)
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

  # See https://developers.google.com/drive/api/v3/search-files
  # for info on how queries work.
  def list_sheets(unsafe_folder_id)
    puts "  list_sheets(#{unsafe_folder_id})"
    folder_id = verify_safe_folder_id!(unsafe_folder_id)
    q = "'#{folder_id}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet'"
    drive_service.list_files(q: q, fields: 'files(id, name, mimeType)')
  end

  def list_folders(unsafe_folder_id)
    puts "  list_folders(#{unsafe_folder_id})"
    folder_id = verify_safe_folder_id!(unsafe_folder_id)
    q = "'#{folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder'"
    drive_service.list_files(q: q, fields: 'files(id, name, mimeType)')
  end

  # minimal check for query injection
  def verify_safe_folder_id!(unsafe_folder_id)
    raise "invalid unsafe_folder_id: #{unsafe_folder_id}" if /[^a-zA-Z0-9\-_]/.match(unsafe_folder_id).present?
    unsafe_folder_id
  end

  # Returns [Tab] with CSV data for all sheets
  def download_tab_csvs_batched(sheet_id)
    # Batch this into two API calls, one for the Spreadsheet to get all metadata,
    # then a second batch request to get the contents of each tab.
    spreadsheet = sheets_service.get_spreadsheet(sheet_id)
    sheet_titles = spreadsheet.sheets.map(&:properties).map(&:title)
    batch_responses = sheets_service.batch_get_spreadsheet_values(sheet_id, ranges: sheet_titles)

    # iterate through to zip them together
    tabs = []
    spreadsheet.sheets.each_with_index do |sheet, sheet_index|
      tab_csv = CSV.generate do |csv|
        sheet_values = batch_responses.value_ranges[sheet_index].values
        sheet_values.each {|row| csv << row }
      end 
      tabs << Tab.new({
        spreadsheet_id: spreadsheet.spreadsheet_id,
        spreadsheet_name: spreadsheet.properties.title,
        spreadsheet_url: spreadsheet.spreadsheet_url,
        tab_id: sheet.properties.sheet_id,
        tab_name: sheet.properties.title,
        tab_csv: tab_csv
      })
    end
    tabs
  end

  def drive_service
    if @drive_service.nil?
      drive_service = Google::Apis::DriveV3::DriveService.new
      drive_service.client_options.application_name = @application_name
      drive_service.authorization = check_authorization()
      @drive_service = drive_service
    end
    @drive_service
  end

  # See https://github.com/googleapis/google-api-ruby-client/blob/cb0b81f79451b8dee9df07eb248110b3e6045916/generated/google/apis/sheets_v4/service.rb
  # and https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
  def sheets_service
    if @sheets_service.nil?
      sheets_service = Google::Apis::SheetsV4::SheetsService.new
      sheets_service.client_options.application_name = @application_name
      sheets_service.authorization = check_authorization()
      @sheets_service = sheets_service
    end
    @sheets_service
  end

  # A tab of a spreadsheet
  class Tab < Struct.new :spreadsheet_id, :spreadsheet_name, :spreadsheet_url, :tab_id, :tab_name, :tab_csv, keyword_init: true
  end
end
