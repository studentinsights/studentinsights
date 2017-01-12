require 'csv'

namespace :fake_data do
  desc 'Generate bulk service upload CSV'
  task generate_service_upload_csv: :environment do

    CSV.open('data/fake_service_file.csv', 'wb') do |csv|
      csv << ['LASID']

      Student.find_each do |student|
        if 1.in(3)
          csv << [student.local_id]
        end
      end
    end
  end
end
