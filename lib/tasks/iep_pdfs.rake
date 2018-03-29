desc 'IEP PDF import'
namespace :iep_pdfs do
  task bulk_import: :environment do
    IepPdfImportJob.new.bulk_import!
  end

  task nightly_import: :environment do
    IepPdfImportJob.new.nightly_import!
  end
end
