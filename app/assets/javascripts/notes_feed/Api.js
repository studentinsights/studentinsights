class Api {

  getEventNotesData(multiplier, getEventNotes, incrementDaysBack) {
    const daysBack = 30 * multiplier;    
    const url = '/educators/notes_feed_json?days_back=' + daysBack;

    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => getEventNotes(json))
      .then(json => incrementDaysBack());
  }
}

export default Api;
