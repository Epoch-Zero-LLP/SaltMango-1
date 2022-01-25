const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

const dataHandling = require("../functions");

async function decodeIDToken(req, res, next) {
  functions.logger.log(req.body)

  if (req.body.blahblah === 'blahblah') {
    functions.logger.log("coldstart");
    return res.json('coldstart')
  }
  functions.logger.log(req.path);

  const idToken = req.body.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log(decodedToken.uid);
    const adminUid = (await db.collection("Admin").doc("Admin_Info").get()).data().uid
    if (decodedToken.uid === adminUid) {
      req.body.UserId = decodedToken.uid;
      // req.body.token = decodedToken.uid;
      delete req.body.token;
      return next();
    } else {
      return res.json({ 'message': 'token not verified' });

    }

  } catch (err) {
    functions.logger.error(err);
    req.body.UserId = '';
    return res.json({ 'message': 'token not verified', 'error': err });
  }
}

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
function arrayRemove(array, element) {
  const arr = array;
  const index = arr.indexOf(element);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr

}
async function login(collectionName, field, data, field2, data2) {
  let Id;
  return db.collection(collectionName).where(field, "==", data).where(field2, "==", data2).limit(1).get().then(snap => {
    console.log(snap.size)
    Id = snap.docs[0].id
    return admin.auth().createCustomToken(Id)
  }).then(token => {
    return token
  })
    .catch(err => {
      functions.logger.error(err);
      return false;
    })

}//pageamin,teamlead,teammanager


async function loginForAdmins(req, res) {
  const user = req.body.Username;
  let ret = false;
  const pass = req.body.Password;
  const admins = await db.collection("Admin").doc("Admin_Info").get();
  if (admins.data().Username === user && admins.data().Password === pass) {
    const gen = await admin.auth().createCustomToken(admins.data().uid)
    ret = { token: gen }
  }
  return ret
}

async function token(id) {
  return await admin.auth().createCustomToken(id)
}

async function decodeIDTokenHeader(req, res, next) {
  if (req.body.blahblah === 'blahblah') {
    functions.logger.log("coldstart");
    return res.json('coldstart')
  }
  functions.logger.log(req.path);

  functions.logger.log(req.get('Authorization'));
  functions.logger.log(req.body);
  let encoded = req.get('Authorization');
  if (encoded === undefined || encoded === null) {
    res.status(401).json({ "message": "token not verified" });
  } else {
    const idToken = encoded.replace('Bearer ', '');
    console.log(idToken);

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(decodedToken.uid);
      req.body.UserId = decodedToken.uid;
      delete req.body.Token;
      return next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ "message": "token not verified", "error": err });
    }

  }
  return console.log('Decode Completed');
}

const createKeywords = (name, resultArr) => {
  if (name === undefined) { name = "" }
  let curName = '';
  let temp = name;
  let len = name.split(' ').length;
  for (let i = 0; i < len; i++) {
    for (let k = 0; k < temp.split('').length; k++) {
      letter = temp[k]
      curName += letter.toLowerCase();
      if (!resultArr.includes(curName)) {
        resultArr.push(curName);
      }
    }
    temp = temp.split(' ')
    temp.splice(0, 1);
    temp = temp.join(" ")
    curName = '';
  }
}

function decodeIDTokenForLogin(req, res, next) {
  if (req.body.blahblah === 'blahblah') {
    functions.logger.log("coldstart");
    return res.json('coldstart')
  }
  functions.logger.log(req.path);
  return next();
}

const Point = 10;
const ReferralPoint = 20;
const ReferredPoint = 30;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {

    // Generate random number
    let j = Math.floor(Math.random() * (i + 1));

    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

function Keygenerator(num) {
  let generator = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyskiouhjnmbhj'

  for (let i = 0; i < num; i++) {
    generator += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  let array = generator;
  return (array)
}




async function drawWinnerPicker(draw,Date){
  const arr = [];
    let query;
    let limit = 0;
    const settings = await dataHandling.Read("Admin", "Settings");
    const DrawSet = settings.draw+"Draw";
    DrawSet.forEach((element) => {
      limit = limit + element.WinnerLimit;
    });
    query = db.collection(draw).doc(Date).collection("Entry");
    const dat = [];
    for (let loop = 0; loop < limit; loop++) {
      key = query.doc().id;
      const snapshot = await query
        .where(admin.firestore.FieldPath.documentId(), ">=", key)
        .limit(1)
        .get();
      if (snapshot.size > 0) {
        snapshot.forEach((doc) => {
          if (!arr.includes(doc.data().UserId)) {
            arr.push(doc.data().UserId);
            dat.push(doc.data().UserId);
          } else {
            limit = limit + 1;
          }
        });
      } else {
        const snapshots = await query
          .where(admin.firestore.FieldPath.documentId(), "<", key)
          .limit(1)
          .get();

        snapshots.forEach((doc) => {
          if (!arr.includes(doc.data().UserId)) {
            arr.push(doc.data().UserId);
            dat.push(doc.data().UserId);
          } else {
            limit = limit + 1;
          }
        });
      }
    }
    let f = 0;
    DrawSet.forEach((snap) => {
      let l = f + snap.WinnerLimit;
      snap.Winners = dat.slice(f, l);
      f = l;
    });
    return await db
      .collection(draw)
      .doc(Date)
      .update({ WinnersData: DrawSet });
}







module.exports = {
  decodeIDToken,
  makeid,
  arrayRemove,
  login,
  decodeIDTokenHeader,
  createKeywords,
  loginForAdmins,
  decodeIDTokenForLogin,
  Point,
  ReferralPoint,
  drawWinnerPicker,
  ReferredPoint,
  shuffleArray,
  Keygenerator
}