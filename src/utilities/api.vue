<script>

import axios from 'axios';

const getSchema = schemaUrl => axios({
  method: 'GET',
  url: schemaUrl,
});

const verifyPDFServer = (url, publicKey, token) => axios({
  method: 'PUT',
  url: url + '/verify',
  headers: { token },
  data: {
    publicKey
  }
})

export default {
  getSchema,
  verifyPDFServer,
}
</script>
