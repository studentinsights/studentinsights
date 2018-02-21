class Api {

  getPastServiceUploads(onSucceed) {
    const url = '/service_uploads/past';

    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => { return onSucceed(json); });
  }

  validateLasidsInUploadFile (uploadLasids, onSucceed, onError) {
    const url = '/students/lasids.json';

    return fetch(url, { credentials: 'include' })
             .then(response => response.json())
             .then(allLasids => {
                return Array.isArray(allLasids)
                         ? onSucceed(uploadLasids, allLasids)
                         : onError()
             });
  }
}

export default Api;
