class SchoolFilter < Struct.new(:school_local_ids)
  def include?(row)
    school_local_ids.nil? || school_local_ids.include?(row[:school_local_id])
  end
end
