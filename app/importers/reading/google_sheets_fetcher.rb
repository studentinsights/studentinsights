# Returns array of CSVs from a Google Drive Folder. Requires a Google Service Account with read permissions for the folder
# Service account created as follows:
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
# 11. Use the folder id (the last part of the folder url) reading_sheets_fetcher.rb
# 12. Set the following environment variables from the key in step 8: GOOGLE_ACCOUNT_TYPE, GOOGLE_CLIENT_EMAIL, GOOGLE_CLIENT_ID, GOOGLE_PRIVATE_KEY

require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

class GoogleSheetsFetcher

  APPLICATION_NAME = 'Student Insights'.freeze
  SCOPE = [Google::Apis::DriveV3::AUTH_DRIVE_READONLY, Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY]

  def get_sheets_from_folder(folder_id)
    auth = Google::Auth.get_application_default(scope: SCOPE)
    sheet_ids = get_sheet_ids(auth, folder_id)
    download_csvs(auth, sheet_ids)
  end

  private
  def get_sheet_ids(auth, folder_id)
    # initialize drive API
    drive_service = Google::Apis::DriveV3::DriveService.new
    drive_service.client_options.application_name = APPLICATION_NAME
    drive_service.authorization = auth

    drive_service.list_files(q: "'#{folder_id}' in parents",
                                      fields: 'files(id, name)')
  end

  def download_csvs(auth, sheet_ids)
    #Initialize sheets API
    sheet_service = Google::Apis::SheetsV4::SheetsService.new
    sheet_service.client_options.application_name = APPLICATION_NAME
    sheet_service.authorization = auth

    # Get values from sheets indexed by sheet name
    sheet_ids.files.each_with_object({}) do |spreadsheet, hash| #each spreadsheet in the folder
      sheet_service.get_spreadsheet(spreadsheet.id).sheets.each do |sheet| #each sheet in the spreadsheet
        hash[sheet.properties.title] = CSV.generate do |csv|
          sheet_values = sheet_service.get_spreadsheet_values(spreadsheet.id, sheet.properties.title).values
          sheet_values.each do |row|
            csv << row
          end
        end
      end
    end
  end
end
