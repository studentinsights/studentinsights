class IepDocumentsController < ApplicationController

  def show
    safe_params = params.permit(:id)
    iep_document = IepDocument.find(safe_params[:id])
    authorized_or_raise! { iep_document.student }

    file_name = iep_document.file_name
    bytes = read_iep_document_bytes(file_name)
    send_data bytes, filename: file_name, type: 'application/pdf', disposition: 'inline'
  end

  private

  def read_iep_document_bytes(file_name)
    if ENV['USE_PLACEHOLDER_IEP_DOCUMENT']
      File.read("#{Rails.root}/public/demo-blank-iep.pdf")
    else
      bucket_name = ENV['AWS_S3_IEP_BUCKET']
      Aws::S3::Client.new.get_object({
        bucket: bucket_name,
        key: file_name
      }).body.read
    end
  end
end
