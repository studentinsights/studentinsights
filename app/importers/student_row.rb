class StudentRow < Struct.new(:row)

  def self.build(row)
    new(row).build
  end

  def build
    student = Student.find_or_initialize_by(local_id: row[:local_id])

    attributes = Hash[row].except(:local_id, :school_local_id, :full_name, :homeroom)
                          .merge(split_first_and_last_name)

    student.assign_attributes(attributes)

    return student
  end

  def split_first_and_last_name
    name_split = row[:full_name].split(", ")

    return { first_name: name_split[1], last_name: name_split[0] } if name_split.size == 2
    return { first_name: nil, last_name: name_split[0] } if name_split.size == 1
  end

end
