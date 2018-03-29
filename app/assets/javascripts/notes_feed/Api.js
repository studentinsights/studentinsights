import {apiFetchJson} from '../helpers/apiFetchJson';

class Api {

  getEventNotesData(multiplier, getEventNotes, incrementMultiplier) {
    const batchSize = 30 * multiplier;    
    const url = '/educators/notes_feed_json?batch_size=' + batchSize;
    return apiFetchJson(url)
      .then(json => { return getEventNotes(json); })
      .then(json => incrementMultiplier());
  }
}

export default Api;
