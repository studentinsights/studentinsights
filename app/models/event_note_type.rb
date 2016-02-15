class EventNoteType < ActiveRecord::Base
  def self.seed_somerville_event_note_types
    EventNoteType.destroy_all
    EventNoteType.create([
      { id: 300, name: 'SST Meeting' },
      { id: 301, name: 'MTSS Meeting' },
      { id: 302, name: 'Parent conversation' },
      { id: 303, name: '51a filing' }, # TODO(kr) deprecated
      { id: 304, name: 'Something else' }
    ])
  end
end
