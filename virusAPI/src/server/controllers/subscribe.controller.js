import subscribeModule from '../modules/subscribe.module';

/**
 * User 資料表
 */
const getFriends = (req, res) => {
  const user_id = req.params.user_id;
  subscribeModule.getFriends(user_id).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

const getSearch = (req, res) => {
  const substring = req.body.substring;
  subscribeModule.getSearch(substring).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

/*  User GET 取得  */
const subscribeGet = (req, res) => {
  const subscriber_id = req.params.subscriber_id;
  const subscribed_id = req.params.subscribed_id;
  subscribeModule.isSubscribed(subscriber_id, subscribed_id).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

/*  User DELETE  */
const deleteSubscribe = (req, res) => {
  // 取得修改id
  const deleteValues = {
    subscriber_id: req.params.subscriber_id, 
    subscribed_id: req.params.subscribed_id,
  };
  subscribeModule.deleteSubscribe(deleteValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

/* User  POST 新增 */
const createSubscribe = (req, res) => {
  // 取得新增參數
  const insertValues = {
    user_id: req.params.subscriber_id,
    friend_id: req.params.subscribed_id,
    is_delete: req.headers.is_delete,
  };
  subscribeModule.createSubscribe(insertValues.user_id, insertValues.friend_id,insertValues.is_delete).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

const getCountById = (req, res) => {
  const subscribed_id = req.params.subscribed_id;
  subscribeModule.countBySubscribedId(subscribed_id).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

export default {
  getFriends,
  getSearch,
  subscribeGet,
  deleteSubscribe,
  createSubscribe,
  getCountById
};
