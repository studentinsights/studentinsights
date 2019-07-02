class BedfordLaneTransitionNotesImporter
  def initialize(options = {})
    @folder_id = '1aOCYCWImQa3KdST8GoePwhHc_ITN_qIP'
    @fetcher = GoogleSheetsFetcher.new
  end

  def import
    
    tabs = @fetcher.get_tabs_list_from_folder(folder_id)
    rows = tabs.flat_map do |tab|
      process(tab)
    end
    rows
  end

  private
  def process(tab)
    return [] if tab.tab_name === 'INFO'

    # find educator and homeroom by tab.tab_name
    educator = nil
    homeroom = nil

    # read form_url from fetcher
    form_url = nil
    processor = BedfordEndOfYearTransitionProcessor.new(educator, homeroom, form_url)
    processor.
  end
end
