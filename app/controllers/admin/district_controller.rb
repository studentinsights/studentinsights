module Admin
  class DistrictController < ApplicationController
    before_action :authenticate_educator!, :authenticate_admin!

    def notes_heatmap
      @serialized_data ={
        notes: serialized_heatmap_notes()
      }
      render 'shared/serialized_data'
    end

    def restricted_notes_heatmap
      @serialized_data ={
        notes: serialized_heatmap_notes(is_restricted: true)
      }
      render 'shared/serialized_data'
    end

    private
    def serialized_heatmap_notes(options = {}) 
      is_restricted = if options[:is_restricted] === true then true else false end
      notes = EventNote
        .where(is_restricted: is_restricted)
        .includes(:student)

      # Limit the fields we send down, but include the
      # student's grade.
      notes.map do |note|
        note.as_json.slice(
          'id',
          'recorded_at',
          'student_id',
          'event_note_type_id'
        ).merge({
          grade: note.student.grade
        })
      end
    end

    def authenticate_admin!
      redirect_to(homepage_path_for_role(current_educator) unless current_educator && current_educator.admin?
    end
  end
end