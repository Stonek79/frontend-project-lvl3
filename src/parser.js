export default (rssData, commonId) => {
  const parsedRssData = new DOMParser().parseFromString(rssData, 'application/xml');
  let idCount = commonId;
  const feedId = idCount;
  const ftitle = parsedRssData.querySelector('title').textContent;
  const fdescription = parsedRssData.querySelector('description').textContent;
  const postContent = parsedRssData.querySelectorAll('item');
  const feed = { feedId, ftitle, fdescription };
  const commonPosts = [...postContent].reduce((acc, post) => {
    idCount += 1;
    const ptime = post.querySelector('pubDate').textContent;
    const link = post.querySelector('link').textContent;
    const ptitle = post.querySelector('title').textContent;
    const pdescription = post.querySelector('description').textContent;
    return [...acc, {
      id: idCount, ptitle, pdescription, link, ptime: Date.parse(ptime), font: 'bold', feedId,
    }];
  }, []);
  return { feed, commonPosts };
};
