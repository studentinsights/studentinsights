class CleanupReport < Struct.new :log, :file_name, :pre_cleanup_size, :post_cleanup_size

  def print
    log.write([spacing, before_text, after_text, spacing].join("\n"))
  end

  def spacing
    "\n\n"
  end

  def before_text
    "#{pre_cleanup_size} rows of data in #{file_name} pre-cleanup"
  end

  def after_text
    "#{post_cleanup_size} rows of data in #{file_name} post-cleanup"
  end

end
