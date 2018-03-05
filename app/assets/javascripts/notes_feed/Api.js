class Api {

  getEventNotesData(multiplier, getEventNotes, incrementMultiplier) {
    const batchSize = 30 * multiplier;    
    const url = '/educators/notes_feed_json?batch_size=' + batchSize;

    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => { return getEventNotes(json); })
      .then(json => incrementMultiplier());
  }
}

export default Api;
