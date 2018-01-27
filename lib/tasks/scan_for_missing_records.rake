desc 'Scan for missing foreign key records'
namespace :missing_foreign_key_relations do
  task scan: :environment do
    puts "Missing School IDs on Course"
    missing = []
    Course.find_each do |course|
      if !course.school
        missing << course.school_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing School IDs on Educator"
    missing = []
    Educator.find_each do |educator|
      if !educator.school
        missing << educator.school_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing EventNote IDs on EventNoteAttachment"
    missing = []
    EventNoteAttachment.find_each do |attachment|
      if !attachment.event_note
        missing << attachment.event_note_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing EventNote IDs on EventNoteRevision"
    missing = []
    EventNoteRevision.find_each do |revision|
      if !revision.event_note
        missing << revision.event_note_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Educator IDs on EventNote"
    missing = []
    EventNote.find_each do |note|
      if !note.educator
        missing << note.educator_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing EventNoteType IDs on EventNote"
    missing = []
    EventNote.find_each do |note|
      if !note.event_note_type
        missing << note.event_note_type_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on EventNote"
    missing = []
    EventNote.find_each do |note|
      if !note.student
        missing << note.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing School IDs on Homeroom"
    missing = []
    Homeroom.find_each do |homeroom|
      if !homeroom.school
        missing << homeroom.school_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on IepDocument"
    missing = []
    IepDocument.find_each do |document|
      if !document.student
        missing << document.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Educator IDs on Intervention"
    missing = []
    Intervention.find_each do |intervention|
      if !intervention.educator
        missing << intervention.educator_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing InterventionType IDs on Intervention"
    missing = []
    Intervention.find_each do |intervention|
      if !intervention.intervention_type
        missing << intervention.intervention_type_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on Intervention"
    missing = []
    Intervention.find_each do |intervention|
      if !intervention.student
        missing << intervention.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Course IDs on Section"
    missing = []
    Section.find_each do |section|
      if !section.course
        missing << section.course_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Educator IDs on ServiceUpload"
    missing = []
    ServiceUpload.find_each do |upload|
      if !upload.uploaded_by_educator
        missing << upload.uploaded_by_educator_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Educator IDs on Service"
    missing = []
    Service.find_each do |service|
      if !service.recorded_by_educator
        missing << service.recorded_by_educator_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing ServiceType IDs on Service"
    missing = []
    Service.find_each do |service|
      if !service.service_type
        missing << service.service_type_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on Service"
    missing = []
    Service.find_each do |service|
      if !service.student
        missing << service.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Assessment IDs on StudentAssessment"
    missing = []
    StudentAssessment.find_each do |student_assesment|
      if !student_assesment.assessment
        missing << student_assesment.assessment_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on StudentAssessment"
    missing = []
    StudentAssessment.find_each do |student_assesment|
      if !student_assesment.student
        missing << student_assesment.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing Student IDs on StudentRiskLevel"
    missing = []
    StudentRiskLevel.find_each do |risk_level|
      if !risk_level.student
        missing << risk_level.student_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""

    puts "Missing School IDs on Student"
    missing = []
    Student.find_each do |student|
      if !student.school
        missing << student.school_id
      end
    end
    puts "#{missing.length} records missing an object. Missing IDs: #{missing.uniq}"
    puts ""
  end
end
