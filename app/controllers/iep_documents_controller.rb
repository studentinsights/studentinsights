class IepDocumentsController < ApplicationController

  def show
    iep_document = IepDocument.find_by_id!(params[:id])
    authorized_or_raise! { iep_document.student }

    file_name = iep_document.file_name
    bucket_name = ENV['AWS_S3_IEP_BUCKET']
    object = s3.get_object({
      bucket: bucket_name,
      key: file_name
    })

    send_data object.body.read, filename: file_name, type: :pdf
  end

  private
  def s3
    @client ||= Aws::S3::Client.new
  end
end
