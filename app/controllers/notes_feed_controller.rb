class NotesFeedController < ApplicationController

  def show
    time_interval = Date.today - 2400
    notes = EventNote.where(educator_id: 1).where("recorded_at >= ?", time_interval).order("recorded_at DESC")
    @serialized_data = {
      # students: section_students,
      notes: notes,
      current_educator: current_educator,
    }
    puts "************************"
    puts @serialized_data
    notes.each do |note|
      puts note.text
    end
    puts "************************"
    render 'shared/serialized_data'
  end
end
