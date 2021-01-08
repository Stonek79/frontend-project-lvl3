// @ts-check
import axios from 'axios';

const proxy = 'https://api.allorigins.win';

export default (url) => axios.get(`${proxy}/get?url=${url}`)
  .then((response) => {
    if (!response.data.status.content_type.includes('rss')) {
      throw new Error('mustHaveRSS');
    }
    return response.data;
  });
