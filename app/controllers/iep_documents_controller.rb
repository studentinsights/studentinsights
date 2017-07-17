class IepDocumentsController < ApplicationController

  def show
    object = s3.get_object({
      bucket: 'test-test-mc-testing',
      key: 'newspaper-article.pdf'
    })

    pdf = object.body.read

    send_data pdf, filename: "eeeeeee.pdf", type: :pdf
  end

  private

    def s3
      @client ||= Aws::S3::Client.new
    end

end
