require 'json'

namespace :load_data do
  desc "Load production intervention data into local env or a staging site"
  task interventions: :environment do
    puts "Interventions count before: #{Intervention.count}"; puts
    puts "Pulling data from JSON ./data/interventions.json ..."; puts

    file = File.read('./data/interventions.json')

    data = JSON.parse(file)

    puts "Found #{data.size} JSON interventions to load!"; puts;

    ActiveRecord::Base.transaction do
      data.each do |intervention_data|
        intervention = Intervention.new(intervention_data)
        intervention.save!
        puts "."
      end
    end

    puts "Interventions count after: #{Intervention.count}"; puts
  end
end
