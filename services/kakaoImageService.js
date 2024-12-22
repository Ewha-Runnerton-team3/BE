import kakaoImageSearch from '../utils/kakaoImage.js';

const getImages = async (searchTerm) => {
  try {
    const images = await kakaoImageSearch(searchTerm);
    return images.map((image) => ({
      thumbnail: image.thumbnail_url,
      url: image.image_url,
      source: image.display_sitename,
    }));
  } catch (error) {
    console.log(error.message);
    throw new Error('이미지 데이터를 가져오는 중 오류가 발생했습니다.');
  }
};

export default getImages;