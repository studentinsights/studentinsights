AuthTrail.geocode = false

AuthTrail.identity_method = lambda do |request, opts, user|
  PerDistrict.new.educator_username_to_identity(user)
end


