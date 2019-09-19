# This is intended for use in a one-off analysis task.
# See NotesReview for group reflection.
#
class ExportNotesSample
  def grab_csv(student_ids, options = {})
    event_notes = unsafe_query(student_ids, options)
    sampled_event_notes, total_count = sampled(event_notes, options)
    render(sampled_event_notes, total_count, options)
  end

  def unsafe_query(student_ids, options = {})
    start_date = options[:start_date]
    end_date = options[:end_date]
    is_restricted = options.fetch(:is_restricted, false)

    # Query in time range
    EventNote.all
      .where(student_id: student_ids)
      .where('recorded_at > ?', start_date)
      .where('recorded_at < ?', end_date.advance(days: 1))
      .where(is_restricted: is_restricted)
      .includes(:educator)
  end

  # Sample within that, deterministically
  def sampled(event_notes, options = {})
    n = options[:n]
    seed = options[:seed]

    sampled_event_notes = event_notes.sample(n, random: Random.new(seed))
    [sampled_event_notes, event_notes.size]
  end

  def render(sampled_event_notes, total_count, options)
    CSV.generate do |csv|
      csv << [
        'options:',
        options.inspect,
        'sampled_event_notes.size:',
        sampled_event_notes.size,
        'total_count:',
        total_count,
      ]
      csv << []
      csv << [
        'event_note.id',
        'hash(event_note.educator_id)',
        'hash(event_note.student.id)',
        'hash(event_note.student.school_id)',
        'hash(bucket)',
        'event_note.student.id',

        'event_note.is_restricted',
        'event_note.event_note_type.name',
        'event_note.text',
      ]
      sampled_event_notes.each do |event_note|
        csv << [
          event_note.id,
          hash(event_note.educator_id),
          hash(event_note.student.id),
          hash(event_note.student.school_id),
          hash([event_note.student.school_id, event_note.student.grade].join(':')),
          event_note.student.id,

          event_note.is_restricted,
          event_note.event_note_type.name,
          event_note.text.gsub(/\n/, ' ')
        ]
      end
    end
  end

  private
  def hash(value)
    Digest::SHA256.hexdigest(value.to_s)
  end
end
