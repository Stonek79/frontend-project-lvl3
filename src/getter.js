import axios from 'axios';

export default (url) => axios(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`)
  .then((response) => {
    if (!response.data.status.content_type.includes('rss')) {
      throw new Error('mustHaveRSS');
    }
    return response.data;
  });
