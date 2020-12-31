export default {
  CDN_URL: 'https://cdn.han3sui.com',
  REQUEST_URL: process.env.NODE_ENV === 'development' ? 'http://192.168.1.11:8199' : 'https://cashbook.han3sui.com',
  API_VERSION: '/api/v3'
}
