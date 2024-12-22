import axios from 'axios';

const kakaoImageSearch = async (query) => {
  try {
    const response = await axios.get('https://dapi.kakao.com/v2/search/image', {
      headers: {
        Authorization: `KakaoAK ${process.env.REST_API_KEY}`,
      },
      params: { query, size: 1 },
    });
    return response.data.documents; // 이미지 목록 반환
  } catch (error) {
    console.error('Kakao API error:', error.message);
    throw new Error('이미지 검색 실패');
  }
};

export default kakaoImageSearch;
