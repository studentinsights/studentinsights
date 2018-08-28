import {
  apiFetchJson,
  apiPostJson,
  apiDeleteJson
} from '../helpers/apiFetchJson';

class Api {

  createServiceUploads(params = {}) {
    return apiPostJson('/service_uploads.json', params);
  }

  deleteServiceUpload(id) {
    return apiDeleteJson('/service_uploads/' + id + '.json');
  }

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
