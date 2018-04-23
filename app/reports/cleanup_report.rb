class CleanupReport < Struct.new :log, :file_name, :pre_cleanup_size, :post_cleanup_size

  def print
    log.puts("CleanupReport:\n" + [extra_spacing, before_text, after_text, extra_spacing].join("\n"))
  end

  def extra_spacing
    "\n"
  end

  def before_text
    "#{pre_cleanup_size} rows of data in #{file_name} pre-cleanup"
  end

  def after_text
    "#{post_cleanup_size} rows of data in #{file_name} post-cleanup"
  end

end
