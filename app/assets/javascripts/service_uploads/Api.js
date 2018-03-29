import {apiFetchJson} from '../helpers/apiFetchJson';

class Api {

  getPastServiceUploads(onSucceed) {
    const url = '/service_uploads/past';

    return apiFetchJson(url)
      .then(json => { return onSucceed(json); });
  }

  validateLasidsInUploadFile (uploadLasids, onSucceed, onError) {
    const url = '/students/lasids.json';

    return apiFetchJson(url)
             .then(allLasids => {
               return Array.isArray(allLasids)
                         ? onSucceed(uploadLasids, allLasids)
                         : onError();
             });
  }
}

export default Api;
