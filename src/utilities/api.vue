<script>

import axios from 'axios';

const getSchema = schemaUrl => axios({
  method: 'GET',
  url: schemaUrl,
});

export default {
  getSchema,
}
</script>
