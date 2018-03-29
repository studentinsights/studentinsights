class AddNinthGradeExperienceEventType < ActiveRecord::Migration[5.1]
  def change
    return if EventNoteType.where(id: 305).present?

    EventNoteType.create({ id: 305, name: '9th Grade Experience' })
  end
end
