export default {
  routes: [
    {
     method: 'GET',
     path: '/test-items',
     handler: 'test-item.find',
     config: {
       auth: false,
     },
    },
  ],
};
