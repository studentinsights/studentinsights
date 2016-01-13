module Connector

  attr_reader :client, :data_transformer, :school_scope, :recent_only, :first_time

  def initialize(options = {})
    # Required arguments
    @client = options[:client]
    @data_transformer = options[:data_transformer] || data_transformer

    # Optional arguments
    @school_scope = options[:school_scope]
    @recent_only = options[:recent_only]
    @first_time = options[:first_time]
  end

  def connect_transform_import
    file = @client.read_file(remote_file_name)
    data = @data_transformer.transform(file)
    import(data)
  end

  def connect_transform_import_locally
    path = @client.file_tmp_path(remote_file_name)
    unless File.exist? path
      @client.download_file_to_tmp(remote_file_name)
    end
    file_as_string = File.read(path).encode('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
    data = @data_transformer.transform(file_as_string)
    import_locally(data)
  end

end
