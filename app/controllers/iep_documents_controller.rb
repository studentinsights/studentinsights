class IepDocumentsController < ApplicationController

  before_action :find_iep_document, :authorize!

  def show
    @file_name = @iep_document.file_name
    @bucket_name = ENV['AWS_S3_IEP_BUCKET']

    object = s3.get_object({
      bucket: @bucket_name,
      key: @file_name
    })

    send_data object.body.read, filename: @file_name, type: :pdf
  end

  private

    def find_iep_document
      @iep_document = IepDocument.find_by_id!(params[:id])
    end

    def student
      @iep_document.student
    end

    def authorize!
      unless current_educator.is_authorized_for_student(student)
        raise Exceptions::EducatorNotAuthorized
      end
    end

    def s3
      @client ||= Aws::S3::Client.new
    end

end
