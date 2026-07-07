try {
  const mediaControl = require('win-media-control');
  console.log('库加载成功');
  
  mediaControl.listSessions().then(sessions => {
    console.log('找到的媒体会话:', sessions);
  }).catch(err => {
    console.error('获取会话失败:', err);
  });
} catch (e) {
  console.error('库加载失败:', e);
}