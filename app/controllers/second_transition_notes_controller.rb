class SecondTransitionNotesController < ApplicationController
  before_action :ensure_authorized_for_feature!

  # The full list for the transition note page.
  def transition_students_json
    ensure_authorized_for_feature!
    students = authorized do
      unsafe_students_within_scope.includes(*[
        :school,
        :student_photos,
        :second_transition_notes
      ]).to_a
    end
    students_json = students.as_json({
      only: [
        :id,
        :first_name,
        :last_name,
        :grade,
        :counselor,
      ],
      methods: [
        :has_photo
      ],
      include: {
        second_transition_notes: {
          only: [:id, :starred, :educator_id, :student_id, :recorded_at]
        },
        school: {
          only: [:id, :local_id, :name]
        }
      }
    })
    render json: {
      students: students_json
    }
  end

  # post
  def save_json
    ensure_authorized_to_write!
    safe_params = params.permit(*[
      :student_id,
      :second_transition_note_id,
      :starred,
      :restricted_text, {
        form_json: [
          :strengths,
          :connecting,
          :community,
          :peers,
          :family,
          :other
        ]
      }
    ])
    student_id = safe_params[:student_id]
    id = safe_params[:second_transition_note_id]
    attrs = {
      form_json: safe_params[:form_json],
      starred: safe_params[:starred],
      restricted_text: safe_params[:restricted_text]
    }

    # create or update
    if id.nil?
      authorized_or_raise! { Student.find(student_id) }
      second_transition_note = SecondTransitionNote.create!(attrs.merge({
        recorded_at: Time.now,
        educator_id: current_educator.id,
        student_id: student_id,
        form_key: SecondTransitionNote::SOMERVILLE_TRANSITION_2019
      }))
    else
      second_transition_note = verify_authorized_or_raise!(student_id, id)
      second_transition_note.update!(attrs)
    end

    render json: {
      id: second_transition_note.id
    }
  end

  # delete
  def delete_json
    ensure_authorized_to_write!
    safe_params = params.permit(:student_id, :second_transition_note_id)
    second_transition_note = verify_authorized_or_raise!(safe_params[:student_id], safe_params[:second_transition_note_id])

    second_transition_note.destroy!
    render json: { status: 'ok' }
  end

  # get
  def restricted_text_json
    ensure_authorized_to_read!
    safe_params = params.permit(*[
      :student_id,
      :second_transition_note_id,
    ])
    second_transition_note = verify_authorized_or_raise!(safe_params[:student_id], safe_params[:second_transition_note_id])

    render json: second_transition_note.as_json({
      dangerously_include_restricted_text: true,
      only: [:restricted_text]
    })
  end

  # get
  def next_student_json
    ensure_authorized_to_read!
    params.require(:student_id)
    student_id = params[:student_id]

    student = authorized_or_raise! { Student.find(student_id) }
    students = authorized do
      unsafe_students_within_scope.to_a.sort_by do |s|
        "#{s.last_name}, #{s.first_name}"
      end
    end

    # find ids
    index = students.index(student)
    previous_student = index == 0 ? students.last : students[index - 1]
    next_student = index == students.size - 1 ? students.first : students[index + 1]
    render json: {
      previous_student_id: previous_student.id,
      next_student_id: next_student.id
    }
  end

  private
  # This determines which students are in scope for the feature,
  # without the authorization check.
  def unsafe_students_within_scope
    # 8th > 9th grade students from any school
    to_high_school = Student.active.where(grade: '8')

    # 5th > 6th graders at one particular school.
    to_middle_school = Student.active.where({
      school_id: School.find_by_local_id('BRN').try(:id)
    })

    # Return a relation
    to_high_school.or(to_middle_school)
  end

  def ensure_authorized_for_feature!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_transition_note_features')
  end

  def ensure_authorized_to_read!
    ensure_authorized_for_feature!
    student = Student.find(params[:student_id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def ensure_authorized_to_write!
    ensure_authorized_to_read!
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('k8_counselor')
  end

  # Verify authorization for both student and note id
  def verify_authorized_or_raise!(student_id, second_transition_note_id)
    student = authorized_or_raise! { Student.find(student_id) }
    second_transition_note = student.second_transition_notes.find(second_transition_note_id)
    raise Exceptions::EducatorNotAuthorized if second_transition_note.nil?
    raise Exceptions::EducatorNotAuthorized if second_transition_note.student_id != student_id.to_i

    second_transition_note
  end
end
