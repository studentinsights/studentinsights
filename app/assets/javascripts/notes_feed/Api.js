class Api {

  getEventNotesData(multiplier, getEventNotes, incrementMultiplier) {
    const daysBack = 30 * multiplier;    
    const url = '/educators/notes_feed_json?days_back=' + daysBack;

    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => { return getEventNotes(json); })
      .then(json => incrementMultiplier());
  }
}

export default Api;
