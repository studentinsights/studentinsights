# This provides methods for reading in fixture data for specific controller endpoints,
# which can be useful when prototyping new features where distributions in development data
# don't match production data.
class DevelopmentFixtures
  def students_show
    JSON.parse(IO.read("#{Rails.root}/data/cleaned_all_ss.json")).map do |student|
      clean_student_hash student
    end
  end

  def students_star_reading
    return parse_fixture('students_with_star_reading.json').map do |student|
      clean_student_hash student
    end
  end

  private
  def parse_fixture(relative_path)
    fixture_filename = "#{Rails.root}/data/#{relative_path}"
    JSON.parse(IO.read(fixture_filename))
  end

  # remove sensitive-ish fields
  def clean_student_hash(student_hash)
    student_hash.except(:address).merge({
      first_name: ["Aladdin", "Chip", "Daisy", "Mickey", "Minnie", "Donald", "Elsa", "Mowgli", "Olaf", "Pluto", "Pocahontas", "Rapunzel", "Snow", "Winnie"].sample,
      last_name: ["Disney", "Duck", "Kenobi", "Mouse", "Pan", "Poppins", "Skywalker", "White"].sample
    })
  end
end