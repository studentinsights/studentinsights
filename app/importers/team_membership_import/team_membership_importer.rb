# Load spreadsheet on athletic enrollment
#
# Example:
# importer = TeamMembershipImporter.new(file_text)
# records = importer.create_from_text!
class TeamMembershipImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [],
      merge: DataFlow::MERGE_UPDATE_DELETE_UNMARKED,
      touches: [
        TeamMembership.name
      ],
      description: 'Import rosters for sports teams at SHS, which educators update via Google Sheets from other registration systems'
    })
  end

  def initialize(options:)
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @school_year = options.fetch(:school_year, SchoolYear.to_school_year(Time.now))
    @explicit_folder_id = options.fetch(:explicit_folder_id, nil)
    @skip_explanation_rows_count = options.fetch(:skip_explanation_rows_count, 1)
    @dry_run = options.fetch(:dry_run, false)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new(log: @log))
    @matcher = options.fetch(:matcher, ImportMatcher.new)
    @syncer = options.fetch(:syncer, RecordSyncer.new(log: @log))
  end

  def import
    if !PerDistrict.new.team_membership_importer_enabled?
      log('Aborting since team_membership_importer_enabled? not enabled...')
      return
    end

    log('Fetching tabs...')
    tabs = fetch_tabs()
    log("Found #{tabs.size} tabs.")

    log('Processing each tab...')
    records = []
    tabs.each do |tab|
      log("\n\ntab_id: #{tab.tab_id}, tab.name.first(1): #{tab.tab_name.first(1)}") # minimize logging
      log('Starting loop...')
      StreamingCsvTransformer.from_text(@log, tab.tab_csv).each_with_index do |row, index|
        records << matching_record_for_row(row, index)
      end
      log("Total stats #{records.size} records, #{records.compact.size} non-nil.")
      log('Done loop.')
    end

    log('Syncing all rows...')
    if @dry_run
      log('skipping, dry_run: true...')
      return records
    end

    records.each {|record| @syncer.validate_mark_and_sync!(record) }
    if @explicit_folder_id.present?
      log('Since @explicit_folder_id is present, skipping call to syncer.')
    else
      log('Calling #delete_unmarked_records...')
      @syncer.delete_unmarked_records!(records_within_scope)
    end
    log("syncer stats.to_json: #{@syncer.stats.to_json}")
    log('Done.')
    nil
  end

  def stats
    {
      matcher: @matcher.stats,
      syncer: @syncer.stats
    }
  end

  private
  def fetch_tabs
    folder_id = @explicit_folder_id.present? ? @explicit_folder_id : read_folder_id_from_env()
    @fetcher.get_tabs_from_folder(folder_id)
  end

  def read_folder_id_from_env
    PerDistrict.new.imported_google_folder_ids('shs_sports_teams_folder_id')
  end

  # Explicitly scope to specific school year.
  def records_within_scope
    if @school_year != 2019
      raise "aborting because of unexpected school_year; review the syncer scoping closely before running on another year"
    end
    TeamMembership.where(school_year_text: '2019-20')
  end

  def matching_record_for_row(row, index)
    # Support multiple header rows to explain to users how to enter data, etc.
    if (index) < @skip_explanation_rows_count
      return nil
    end

    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    # translate from 2019-2020 to 2019-20
    school_year_text = begin
      school_year = row['school_year'].split('-').first
      "#{school_year}-#{school_year.last(2).to_i + 1}"
    rescue => err
      nil
    end

    record = TeamMembership.find_or_initialize_by({
      student_id: student_id,
      activity_text: row['activity_text'],
      season_key: row['season'].downcase,
      school_year_text: school_year_text
    })
    record.assign_attributes({
      coach_text: row['coach_name_text']
    })
    record
  end


  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "TeamMembershipImporter: #{text}"
  end
end
