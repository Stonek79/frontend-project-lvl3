import axios from 'axios';

export default (url) => axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${url}`)
  .then((response) => response.data);
