config_data = YAML.load(File.open("district-config.yml"))

DistrictConfig.get_remote_filenames_from_config(config_data)
