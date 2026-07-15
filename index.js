const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.playGame = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  if(!userDoc.exists) return {error: "User not found"};
  const user = userDoc.data();
  
  if(user.games_today >= 10) return {error: "Aaj ka limit khatam"};
  const now = Date.now();
  const last = user.last_play_time?.toMillis() || 0;
  if(now - last < 5 * 60 * 1000) return {error: "5 min wait karo"};

  await userRef.update({
    coins: admin.firestore.FieldValue.increment(5),
    games_today: admin.firestore.FieldValue.increment(1),
    last_play_time: admin.firestore.FieldValue.serverTimestamp()
  });
  return {success: true};
});

exports.redeem = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  const user = userDoc.data();
  
  if(user.coins < 100) return {error: "100 coin chahiye"};
  const now = Date.now();
  const last = user.last_redeem_date?.toMillis() || 0;
  if(now - last < 2 * 24 * 60 * 60 * 1000) return {error: "2 din me 1 baar"};

  await db.collection("redeem_requests").add({
    telegram_id: user.telegram_id, username: user.username, upi: data.upi,
    status: "pending", time: admin.firestore.FieldValue.serverTimestamp()
  });
  
  await userRef.update({
    coins: 0,
    last_redeem_date: admin.firestore.FieldValue.serverTimestamp()
  });
  return {success: true};
});

exports.resetDaily = functions.pubsub.schedule('0 0 *')
  .timeZone("Asia/Kolkata").onRun(async () => {
    const users = await db.collection("users").get();
    const batch = db.batch();
    users.forEach(doc => batch.update(doc.ref, {games_today: 0}));
    await batch.commit();
});
