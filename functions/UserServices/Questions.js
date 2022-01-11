const functions = require('firebase-functions');
const admin = require('firebase-admin');
const dataHandling=require("../functions");
const { Point } = require('../common');
const db = admin.firestore();

async function Read(req,res){
    let checkAnswer=false
    if(req.body.Answer===undefined){
    const data=await dataHandling.Read("QuestionsAndAnswers",req.body.DocId,req.body.index,req.body.Keyword,1);
    (data[0].Options).push(data[0].Answer)
    delete data[0]["Answer"]
    return res.json(data[0]);
    }else{
        const data=await dataHandling.Read("QuestionsAndAnswers",req.body.DocId,req.body.index,req.body.Keyword,1);
        const dat=await dataHandling.Read("QuestionsAndAnswers",req.body.QuestionId);
        User= db.collection("Users").doc(req.body.UserId);
            user=await User.get();
            let score= (user.data().Score) +Point;
           await  User.update({Score: score});
            (data[0].Options).push(data[0].Answer)
            delete data[0]["Answer"]
           if(dat.Answer===req.body.Answer){
              checkAnswer=true
           }
           return res.json({...data[0],CheckAnswer : checkAnswer})
    }
}

module.exports={
    Read
}