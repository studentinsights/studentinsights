class AddNinthGradeExperienceEventType < ActiveRecord::Migration[5.1]
  def change
    return if EventNoteType.find(305).present?

    EventNoteType.create({ id: 305, name: '9th Grade Experience' })
  end
end
