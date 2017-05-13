class SocialNetwork
  def initialize(school)
    @students = school.students
    @educators = school.educators
    @services = @students.flat_map(&:services)
  end

  def network
    pairs.merge(tables)
  end

  private
  # Returns `pairs` with links between students and adults,
  # and also `externals`, which is a list of external adults.
  def pairs
    pairs = []
    externals = []

    @educators.each do |educator|
      educator.students.each do |student|
        pairs << {
          left_id: "e:#{educator.id}",
          right_id: "s:#{student.id}",
          type: 'homeroom'
        }
      end
    end

    @services.each do |service|
      full_name = service.provided_by_educator_name
      educator = @educators.find {|e| e.full_name == full_name }
      if educator
        node_id = "e:#{educator.id}"
      else
        node_id = "x:#{full_name}"
        if externals.find{|e| e[:node_id] == node_id }.nil?
          externals << {
            node_id: node_id,
            full_name: full_name
          }
        end
      end

      pairs << {
        left_id: node_id,
        right_id: "s:#{service.student_id}",
        type: 'service'
      }
    end

    {
      pairs: pairs,
      externals: externals
    }
  end

  # Flat tables for joining
  def tables
    {
      students: @students.map {|s| s.slice(:id, :grade, :first_name, :enrollment_status, :last_name, :school_id).merge(node_id: "s:#{s.id}") },
      educators: @educators.map { |e| e.slice(:id, :full_name, :school_id).as_json.merge({
        homeroom_id: e.homeroom.try(:id),
        node_id: "e:#{e.id}"
      }) }
    }
  end
end