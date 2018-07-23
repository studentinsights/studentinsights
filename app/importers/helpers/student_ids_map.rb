# Lookup in memory, instead of querying db for every row
class StudentIdsMap
  def initialize
    @student_ids_map = nil
  end

  # Find Insights student_id from local_id, nil if no value is found
  def lookup_student_id(local_id)
    reset! if @student_ids_map.nil?
    return nil unless @student_ids_map.has_key?(local_id)
    @student_ids_map[local_id]
  end

  def size
    reset! if @student_ids_map.nil?
    @student_ids_map.keys.size
  end

  # Build map all at once, as a performance optimization
  def reset!
    @student_ids_map = {}
    Student.pluck(:id, :local_id).each do |id, local_id|
      @student_ids_map[local_id] = id
    end
    self
  end
end
