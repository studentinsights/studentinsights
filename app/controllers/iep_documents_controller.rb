class IepDocumentsController < ApplicationController

  before_action :find_iep_document, :authorize!

  def show
    file_name = @iep_document.file_name
    bytes = read_iep_document_bytes(file_name)
    send_data bytes, filename: file_name, type: :pdf
  end

  private

  def find_iep_document
    @iep_document = IepDocument.find_by_id!(params[:id])
  end

  def student
    @iep_document.student
  end

  def authorize!
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def read_iep_document_bytes(file_name)
    if ENV['USE_PLACEHOLDER_IEP_DOCUMENT']
      File.read("#{Rails.root}/public/demo-blank-iep.pdf")
    else
      bucket_name = ENV['AWS_S3_IEP_BUCKET']
      Aws::S3::Client.new.get_object({
        bucket: bucket_name,
        key: file_name
      })
    end
  end
end
