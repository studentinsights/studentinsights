class IepDocumentsController < ApplicationController

  def show
    iep_document = IepDocument.find_by_id!(params[:id])
    authorized_or_raise! { iep_document.student }

    object = s3_object_for_iep(iep_document)
    send_data object.body.read, {
      filename: iep_document.file_name,
      type: :pdf
    }
  end

  private
  def s3
    @client ||= Aws::S3::Client.new
  end

  def s3_object_for_iep(iep_document)
    file_name = iep_document.file_name
    bucket_name = ENV['AWS_S3_IEP_BUCKET']
    s3.get_object({
      bucket: bucket_name,
      key: file_name
    })
  end
end
