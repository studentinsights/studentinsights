# Used to import Google Sheets as CVSs. Requires a Google Service Account, created as follows:
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
# 11. Add the folder name to the list of folders in reading_sheets_fetcher.rb
# 12. Set the following environment variables from the key in step 8: GOOGLE_ACCOUNT_TYPE, GOOGLE_CLIENT_EMAIL, GOOGLE_CLIENT_ID, GOOGLE_PRIVATE_KEY

require 'google/apis/drive_v3'
require 'google/apis/sheets_v4'
require 'googleauth'
require 'fileutils'
require 'csv'

class GoogleSheetsImporter

  APPLICATION_NAME = 'Student Insights'.freeze
  SCOPE = [Google::Apis::DriveV3::AUTH_DRIVE_READONLY, Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY]

  def getSheetsFromFolder(folder_name)
    auth = Google::Auth.get_application_default(scope: SCOPE)
    sheet_ids = getSheetIds(auth, folder_name)
    downloadSheetsAsCVS(auth, sheet_ids)
  end

  private
  def getSheetIds(auth, folder_name)
    # initialize drive API
    drive_service = Google::Apis::DriveV3::DriveService.new
    drive_service.client_options.application_name = APPLICATION_NAME
    drive_service.authorization = auth

    # Get folder ID
    selected_folder = drive_service.list_files(
                                        fields: 'files(id, name)')
    folder_id = selected_folder.files[0].id

    # Get GIDs for all Spreadsheets in folder
    drive_service.list_files(q: "'#{folder_id}' in parents",
                                      fields: 'files(id, name)')
  end

  def downloadSheetsAsCVS(auth, sheet_ids)
    #Initialize sheets API
    sheet_service = Google::Apis::SheetsV4::SheetsService.new
    sheet_service.client_options.application_name = APPLICATION_NAME
    sheet_service.authorization = auth

    # Get values from sheets
    sheet_ids.files.each do |spreadsheet| #each spreadsheet in the folder
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
end
