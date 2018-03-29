class AddTenthGradeExperienceTeamNoteType < ActiveRecord::Migration[5.1]
  def change
    return if EventNoteType.where(id: 306).present?

    EventNoteType.create({ id: 306, name: '10th Grade Experience' })
  end
end
