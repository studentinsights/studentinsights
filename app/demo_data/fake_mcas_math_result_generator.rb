class FakeMcasMathResultGenerator

  def initialize(student)
    @dates = (2010..2015).to_a.shuffle
    @student = student
  end

  def initialize_flavor_data
    flavor = ['Regular', 'Next Generation MCAS'].sample

    assessment_id = Assessment.find_by(
      family: 'MCAS', subject: 'Mathematics', flavor: flavor
    ).id

    scale_score = if flavor == 'Next Generation MCAS'
      rand(400..600)
    else
      rand(200..280)
    end

    return {
      'assessment_id' => assessment_id,
      'scale_score' => scale_score
    }
  end

  def next
    flavor_data = initialize_flavor_data

    {
      assessment_id: flavor_data['assessment_id'],
      date_taken: DateTime.new(@dates.pop, 5, 15),
      scale_score: flavor_data['scale_score'],
      performance_level: ["W", "NI", "P", "A", nil].sample,
      growth_percentile: rand(100),
      student_id: @student.id
    }
  end
end
