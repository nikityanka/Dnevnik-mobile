module.exports = {
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'android',
    select: jest.fn((obj) => obj.android),
  },
  ActivityIndicator: 'ActivityIndicator',
};
