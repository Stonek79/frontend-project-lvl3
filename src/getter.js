import axios from 'axios';

export default (url) => axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${url}`)
  .then((response) => {
    if (!response.data.status.content_type.includes('rss')) {
      throw new Error('mustHaveRSS');
    }
    console.log(response.data);
    return response.data;
  });
