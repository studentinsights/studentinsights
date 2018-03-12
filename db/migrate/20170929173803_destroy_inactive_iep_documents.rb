class DestroyInactiveIepDocuments < ActiveRecord::Migration[5.1]
  def change
    district_name = ENV['DISTRICT_NAME']

    return unless district_name == 'Somerville'

    Student.find_each do |student|
      destroy_inactive_iep_documents_for(student)
    end

    Student.find_each do |student|
      check_for_extra_iep_documents(student)
    end
  end

  def destroy_inactive_iep_documents_for(student)
    documents = IepDocument.where(student_id: student.id)
                           .order(created_at: :desc)
                           .to_a

    return if documents.length == 0
    return if documents.length == 1

    puts; puts "Found #{documents.length} IEP documents..."

    documents.shift

    puts "Destroying #{documents.length} inactive documents..."

    documents.each do |document|
      destroy_document(document)
    end
  end

  def check_for_extra_iep_documents(student)
    documents = IepDocument.where(student_id: student.id)
                           .order(created_at: :desc)
                           .to_a

    raise "Too many documents!" if documents.size > 1
  end

  def destroy_document(document)
    response = client.delete_object(
      bucket: ENV['AWS_S3_IEP_BUCKET'],
      key: document.file_name
    )

    puts "Response from AWS: #{response}"

    document.destroy
  end

  def client
    @client ||= Aws::S3::Client.new
  end

end
