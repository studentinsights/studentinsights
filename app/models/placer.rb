class Placer
  def plots(schools, options = {})
    n = options[:n] || Student.all.size
    seed = options[:seed] || Random.new_seed

    # for generating samples
    # n=100;srand(42);out = { dots: Student.all.sample(n).map {|s| s.slice(:student_address, :school_id) } }.to_json; puts out;nil
    read_or_compute_plots(n, seed)
  end

  private
  # For local development, uses disks to cache some computations
  def read_or_compute_plots(n, seed)
    geos_filename = 'public/somerville.csv' # from https://openaddresses.io/ filtered on Somerville
    places_files = "/Users/krobinson/Desktop/places-#{seed}-#{n}.json"
    plots_file = "/Users/krobinson/Desktop/plots-#{seed}-#{n}.json"
    if File.exist?(plots_file)
      JSON.parse(File.read(plots_file))["plots"]
    else
      dots = JSON.parse(File.read(places_files))["dots"]
      geos = read_geos(geos_filename)
      plots = create_plots_from_dots(dots, geos)
      File.write(plots_file, { plots: plots }.to_json)
      plots
    end
  end

  # With cleaning and rough heuristic, match rate is 83%
  def create_plots_from_dots(dots, geos) 
    plots = dots.map do |dot|
      place = cleaned(dot["student_address"])
      school_id = dot["school_id"]
      geo = geos.find do |geo|
        place.include?(geo[:street]) && place.include?(geo[:number])
      end
      {
        school_id: school_id,
        geo: geo
      }
    end
  end

  def read_geos(geos_filename)
    CSV.read(geos_filename).map do |line|
      lat, long, number, street, apt = line.slice(0, 5)
      {
        coords: [noise(long), noise(lat)],
        number: number,
        street: street,
        apt: apt
      }
    end
  end

  def noise(coord)
    range = 0.002
    (coord.to_f + (rand()*range - range/2)).to_s
  end

  def cleaned(place)
    place
      .upcase
      .sub(/AVE[$\.]/, 'AVENUE').sub(/AVE /, 'AVENUE ')
      .sub(/ST[$\.]/, 'STREET').sub(/ST /, 'STREET ')
      .sub(/RD[$\.]/, 'ROAD').sub(/RD /, 'ROAD ')
  end
end