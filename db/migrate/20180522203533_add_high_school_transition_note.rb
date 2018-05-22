class AddHighSchoolTransitionNote < ActiveRecord::Migration[5.1]
  def change
    return if EventNoteType.where(id: 307).present?

    EventNoteType.create({ id: 307, name: 'High School Transition Note' })
  end
end
