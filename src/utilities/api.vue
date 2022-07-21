<script>

import axios from 'axios';

const getSchema = schemaUrl => axios({
  method: 'GET',
  url: schemaUrl,
});

const attachURL = (origin, resource) => {
  if (origin.endsWith('/')) {
    return origin + resource;
  }

  return origin + '/' + resource;
}

const verifyPDFServer = (url, publicKey, token, serverAppletId) => axios({
  method: 'PUT',
  url: attachURL(url, 'verify'),
  headers: { token },
  data: {
    publicKey,
    serverAppletId,
  }
})

const previewPDF = (url, token, reports, items, images) => axios({
  method: 'PUT',
  url: attachURL(url, 'preview-report'),
  headers: { token },
  responseType: 'blob',
  data: {
    reports, items, images
  }
})

export default {
  getSchema,
  verifyPDFServer,
  previewPDF,
}
</script>
