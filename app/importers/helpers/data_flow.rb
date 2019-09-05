class DataFlow
  FREQUENCY_DAILY = 'frequency_daily'
  FREQUENCY_ONE_TIME_BATCH = 'frequency_one_time_batch'

  SOURCE_SIS_SFTP_CSV = 'source_sis_sftp_csv'
  SOURCE_STAR_VENDOR_SFTP_CSV = 'source_star_vendor_sftp_csv'
  SOURCE_GOOGLE_DRIVE_SHEET = 'source_google_drive_sheet'

  MERGE_UPDATE_DELETE_UNMARKED = 'merge_update_delete_unmarked'
  MERGE_UPDATE_FLAG_UNMARKED = 'merge_update_flag_unmarked'
  MERGE_UPDATE_IGNORE_UNMARKED = 'merge_update_ignore_unmarked'
  MERGE_REPLACE_ALL_WITHIN_SCOPE = 'merge_replace_all_within_scope'
  MERGE_CREATE_NAIVELY = 'merge_create_naively'
  MERGE_APPEND_ONLY = 'merge_append_only'

  OPTION_SCHOOL_SCOPE = 'option_school_scope'
  OPTION_SKIP_OLD_RECORDS = 'option_skip_old_records'
  OPTION_IDIOSYNCRATIC = 'option_idiosyncratic'

  def initialize(options = {})
    keys = [:importer, :source, :frequency, :merge, :touches, :options, :description]
    keys.each {|key| raise "missing option: #{key}" unless options.has_key?(key) }
    @options = options.slice(*keys)
  end

  # override
  def as_json
    @options.as_json
  end

  def importer
    @options[:importer]
  end

  def source
    @options[:source]
  end

  def frequency
    @options[:frequency]
  end

  def merge
    @options[:merge]
  end

  def touches
    @options[:touches]
  end

  def options
    @options[:options]
  end

  def description
    @options[:description]
  end
end
