class SchoolFilter < Struct.new(:school_local_ids)
  def include?(school_local_id)
    school_local_ids.nil? || school_local_ids.include?(school_local_id)
  end
end
