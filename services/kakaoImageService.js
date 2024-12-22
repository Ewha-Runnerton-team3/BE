import kakaoImageSearch from '../utils/kakaoImage.js';

const getImage = async (searchTerm) => {
  try {
    const image = await kakaoImageSearch(searchTerm);
    return image.map((image) => ({
      url: image.image_url,
    }));
  } catch (error) {
    console.log(error.message);
    throw new Error('이미지 데이터를 가져오는 중 오류가 발생했습니다.');
  }
};

export default getImage;