class BaseCsvImporter < Struct.new :school_scope, :client, :log, :progress_bar, :import_record_detail
  def import
    import_record_detail.start
    before_import if self.respond_to?(:before_import)

    @data = CsvDownloader.new(
      log: log, remote_file_name: remote_file_name, client: client, transformer: data_transformer
    ).get_data

    @data.each.each_with_index do |row, index|
      if filter.include?(row)
        import_record_detail.log_processed
        import_row(row)
      else
        import_record_detail.log_excluded
      end
      ProgressBar.new(log, remote_file_name, @data.size, index + 1).print if progress_bar
    end
    after_import if self.respond_to?(:after_import)
    import_record_detail.complete
  end

  def data_transformer
    CsvTransformer.new
  end

  def filter
    SchoolFilter.new(school_scope)
  end

  # Mirror import_record_detail functionality to simplify importers
  def method_missing(name, *args, &block)
    if name.to_s.start_with?("log_") && import_record_detail.respond_to?(name)
      import_record_detail.class.instance_method(name).bind(import_record_detail).call(*args, &blk)
    end
  end
end
