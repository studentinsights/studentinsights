# This works around supporting Teaspoon on Puma 3.7.0.
#
# See https://github.com/jejacks0n/teaspoon/issues/512#issuecomment-277117649
# Having this particular empty file here prevents Puma from loading the configuration
# from `config/puma.rb`.  Teaspoon intends to start Rails on a random port, but isn't
# successfully passing that through to Puma, since in Puma 3.7.0, the prioritization for where
# to take config from changed.