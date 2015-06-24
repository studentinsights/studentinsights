desc "Import STAR assessment results for all schools"
task :import_from_star => :environment do
  importers = [ StarMathImporter.new, StarReadingImporter.new ]
  importers.each { |i| i.connect_to_star_and_import }
end
