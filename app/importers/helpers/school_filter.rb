class SchoolFilter
  def initialize(school_local_ids)
    raise "Invalid school_local_ids: #{school_local_ids}" unless valid?(school_local_ids)
    @school_local_ids = school_local_ids
  end

  def valid?(school_local_ids)
    return true if school_local_ids == :all
    return true if school_local_ids.class == Array
    return false
  end

  def include?(school_local_id)
    return true if @school_local_ids == :all
    return true if @school_local_ids.include?(school_local_id)
    return false
  end
end
