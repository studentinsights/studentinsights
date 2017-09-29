class DestroyInactiveIepDocuments < ActiveRecord::Migration[5.1]
  def change
    district_name = ENV['DISTRICT_NAME']

    return unless district_name == 'Somerville'

    Student.find_each do |student|
      destroy_inactive_iep_documents_for(student)
    end
  end

  def destroy_inactive_iep_documents_for(student)
    documents = IepDocument.where(student_id: student.id)
                           .order(created_at: :desc)
                           .to_a

    return if documents.length == 0
    return if documents.length == 1

    puts; puts "Found #{documents.length} IEP documents..."

    active_document = documents.shift

    puts "Destroying #{documents.length} inactive documents..."

    documents.destroy_all
  end
end
