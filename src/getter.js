// @ts-check
import axios from 'axios';

const proxy = 'https://api.allorigins.win';

export default (url) => axios.get(`${proxy}/get?url=${url}`)
  .then((response) => response.data)
  .catch(() => 'mastHaveRSS');
