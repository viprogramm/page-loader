import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

export default (adapter) => {
  if (adapter === 'http') {
    axios.defaults.adapter = httpAdapter;
  }
  return axios;
};
