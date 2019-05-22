class SecondTransitionNotesController < ApplicationController
  before_action :ensure_authorized_to_read!
  before_action :ensure_authorized_to_write!, except: [:restricted_text]

  # post
  def create_json
    safe_params = params.permit(:student_id, form_json: {})
    student_id = safe_params[:student_id].to_i
    authorized_or_raise! { Student.find(student_id) }

    second_transition_note = SecondTransitionNote.create!({
      educator_id: current_educator.id,
      student_id: student_id,
      form_key: SecondTransitionNote::SOMERVILLE_8TH_TO_9TH_GRADE,
      form_json: safe_params[:form_json],
      starred: false,
      restricted_text: nil
    })
    render json: {
      id: second_transition_note.id
    }
  end

  # put
  def update_json
    safe_params = params.permit(*[
      :student_id,
      :second_transition_note_id,
      :form_json,
      :starred,
      :restricted_text
    ])
    second_transition_note = verify_authorized_or_raise!(safe_params[:student_id], safe_params[:second_transition_note_id])

    second_transition_note.update!({
      form_json: safe_params[:form_json],
      starred: safe_params[:starred],
      restricted_text: safe_params[:restricted_text]
    })
    render json: { status: 'ok' }
  end

  # delete
  def delete_json
    safe_params = params.permit(:student_id, :second_transition_note_id)
    second_transition_note = verify_authorized_or_raise!(safe_params[:student_id].to_i, safe_params[:second_transition_note_id].to_i)

    second_transition_note.destroy!
    render json: { status: 'ok' }
  end

  # get
  def restricted_text
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_view_restricted_notes?
    safe_params = params.permit(*[
      :student_id,
      :second_transition_note_id,
    ])
    second_transition_note = verify_authorized_or_raise!(safe_params[:student_id].to_i, safe_params[:second_transition_note_id].to_i)

    render json: second_transition_note.as_json({
      dangerously_include_restricted_text: true,
      only: [:restricted_text]
    })
  end

  private
  def ensure_authorized_to_read!
    student = Student.find(params[:student_id]).to_i
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_transition_note_features')
  end

  def ensure_authorized_to_write!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('k8_counselor')
  end

  # Verify authorization for both student and note id
  def verify_authorized_or_raise!(student_id, second_transition_note_id)
    student = authorized_or_raise! { Student.find(student_id) }
    second_transition_note = student.second_transition_notes.find(second_transition_note_id)
    puts "second_transition_note: #{second_transition_note.as_json}"
    raise Exceptions::EducatorNotAuthorized if second_transition_note.nil?
    raise Exceptions::EducatorNotAuthorized if second_transition_note.student_id != student_id

    second_transition_note
  end
end
