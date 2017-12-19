district_key = ENV.fetch('DISTRICT_KEY')

config_data = YAML.load(File.open("config/district_#{district_key}.yml"))
                  .fetch("remote_filenames")

DistrictConfig.get_remote_filenames_from_config(config_data)
