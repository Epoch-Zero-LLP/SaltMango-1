const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const common = require('../common')


exports.OnUsersCreate = functions.firestore
    .document("Users/{docid}")
    .onCreate(async (change, context) => {
        const docid = context.params.docid;
        const data = change.data()
        const arr = [];
        common.createKeywords(data.Name, arr)
        Keygenerator()
        async function Keygenerator() {
            let generator = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyskiouhjnmbhj'

            for (let i = 0; i < 4; i++) {
                generator += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            let array = generator;
            const code = await admin.firestore().collection("Users").where("MyCode", "==", array).limit(1).get();
            if (code.size === 0) {
                let ref = docid.substring(0, 3);
                let refcode = array + ref;
                await admin.firestore().collection("Users").doc(docid).update({
                    MyCode: refcode
                })
            }
            else {
                Keygenerator()
            }
        }

        const UserData = { DocId: docid, Keywords: arr, SaltCoin: 0, Diamond: 0 };
        if (data.ReferralCode === "" || data.ReferralCode === null || data.ReferralCode === undefined) {
            return db.collection("Users").doc(docid).update(UserData);
        }
        else {//Referral

            // ReferralCode
            const CheckReferralUser = await db.collection("Users").where("MyCode", "==", data.ReferralCode).limit(1).get()
            if (CheckReferralUser.size === 0) {
                return db.collection("Users").doc(docid).update(UserData);
            }
            const ReferralUser = CheckReferralUser.docs[0];
            // ReferralReward
            const ReferralReward = (await db.doc("Admin/Settings").get()).data().ReferralReward;

            const DirectReferralId = ReferralUser.id;
            const CheckIndirectReferralUser = (await db.collection("Users").doc(ReferralUser.id).get()).data() || {};
            const IndirectReferralId = CheckIndirectReferralUser.DirectReferralId || "";

            await db.doc("Users/" + ReferralUser.id + "/Referral/" + docid).set({
                "index": Date.now(),
                "UserId": docid,
                "Referral": ReferralUser.id,
                "Reward": ReferralReward,
            });

            await db.collection("Users").doc(ReferralUser.id).update({
                "SaltCoin": admin.firestore.FieldValue.increment(ReferralReward),
                "FriendsList": admin.firestore.FieldValue.arrayUnion(docid),
            });

            return db.collection("Users").doc(docid).update({
                ...UserData,
                "FriendsList": admin.firestore.FieldValue.arrayUnion(ReferralUser.id),
                DirectReferralId,
                IndirectReferralId,
            });

        }




    })


exports.OnUsersUpdate = functions.firestore
    .document("Users/{docid}")
    .onUpdate(async (change, context) => {
        const docid = context.params.docid;
        const data = change.after.data();
        const prevData = change.after.data()
        const Date = moment().tz('Asia/Kolkata').subtract(30, "d").format("YYYY-MM-DD")
        const arr = [];
        common.createKeywords(data.Name, arr)
        const UserData = { Keywords: arr };
        if (!common.arrayEquals(data.FriendsList, prevData.FriendsList)) {
            const response = await db.collection("Winners").where("WinDate", ">=", Date).where("UserId", "==", docid).get()
            let batch = firebase.firestore().batch()
            response.docs.forEach((doc) => {
                const docRef = firebase.firestore().collection("Winners").doc(doc.id)
                batch.update(docRef, { FriendsList: data.FriendsList })
            })
            await batch.commit();
        }
        if (data.ReferralCode === prevData.ReferralCode) {
            return db.collection("Users").doc(docid).update(UserData);
        }
        else {//Referral

            // ReferralCode
            const CheckReferralUser = await db.collection("Users").where("ReferralCode", "==", data.ReferralCode).limit(1).get()
            if (CheckReferralUser.size === 0) {
                return db.collection("Users").doc(docid).update(UserData);
            }
            const ReferralUser = CheckReferralUser.docs[0];

            // ReferralReward
            const ReferralReward = (await db.doc("Admin/Settings").get()).data().ReferralReward;

            const DirectReferralId = ReferralUser.id;
            const CheckIndirectReferralUser = (await db.collection("Users").doc(ReferralUser.id).get()).data() || {};
            const IndirectReferralId = CheckIndirectReferralUser.DirectReferralId || "";

            await db.doc("Users/" + ReferralUser.id + "/Referral/" + docid).set({
                "index": Date.now(),
                "UserId": docid,
                "Referral": ReferralUser.id,
                "Reward": ReferralReward,
            });

            await db.collection("Users").doc(ReferralUser.id).update({
                "SaltCoin": admin.firestore.FieldValue.increment(ReferralReward),
                "FriendsList": admin.firestore.FieldValue.arrayUnion(docid),
            });

            return db.collection("Users").doc(docid).update({
                ...UserData,
                "FriendsList": admin.firestore.FieldValue.arrayUnion(ReferralUser.id),
                DirectReferralId,
                IndirectReferralId,
            });

        }

    })