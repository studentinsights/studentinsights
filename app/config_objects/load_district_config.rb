# This class is responsible for pulling YAML district config out of the
# filesystem and parsing it into a Ruby hash.

# This class can be used directly when raw config values are acceptable.
# When validation or server-side logic is needed, use DistrictConfig class.

class LoadDistrictConfig

  def initialize(district_key = ENV['DISTRICT_KEY'])
    @district_key = district_key
  end

  def load
    YAML.load(File.open(config_file_path))
  end

  private

  def district_key_to_config_file
    {
      'somerville' => 'config/district_somerville.yml',
      'new_bedford' => 'config/district_new_bedford.yml',
    }
  end

  def config_file_path
    district_key_to_config_file.fetch(@district_key)
  end

end
