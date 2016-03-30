require "#{Rails.root}/db/seeds/database_constants"

puts 'Seeding constants...'
DatabaseConstants.new.seed!