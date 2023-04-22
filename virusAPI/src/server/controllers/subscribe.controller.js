import subscribeModule from '../modules/subscribe.module';

/**
 * User 資料表
 */

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
  const deleteValues = [req.body.subscriber_id, req.body.subscribed_id];
  subscribeModule.deleteSubscribe(deleteValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

/* User  POST 新增 */
const createSubscribe = (req, res) => {
  // 取得新增參數
  const insertValues = {
    subscriber_id: req.body.subscriber_id,
    subscribed_id: req.body.subscribed_id,
  };
  subscribeModule.createSubscribe(insertValues).then((result) => {
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
  subscribeGet,
  deleteSubscribe,
  createSubscribe,
  getCountById
};
