# Import transition notes, just notes and not 
class BedfordLaneTransitionNotesImporter
  def initialize(folder_id, options = {})
    @folder_id = folder_id
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
  end

  def import
    tabs = @fetcher.get_tabs_from_folder(@folder_id)
    tabs.flat_map do |tab|
      process_tab(tab)
    end

    # TODO(kr) sync to: ImportedForm and to Service
    # TODO(kr) add DataFlow descriptor
    # records = sync(rows)
    # records
  end

  private
  def process_tab(tab)
    # skip info tab
    return [] if tab.tab_name === 'INFO'

    # url to specific tab
    form_url = "#{tab.spreadsheet_url}#gid=#{tab.tab_id}"

    # find educator and homeroom by tab.tab_name
    educator_last_name = tab.tab_name
    educator = @matcher.find_educator_by_last_name(educator_last_name)

    # process and create
    processor = BedfordEndOfYearTransitionProcessor.new(educator, form_url)
    processor.dry_run(tab.tab_csv)
  end
end
