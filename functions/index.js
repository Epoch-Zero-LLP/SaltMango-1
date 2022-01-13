const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ServiceAccount = require('./config/ServiceAccount.json')

admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount)
});

//=========================Apis==============================

const CategoryApis = require('./api/Category')
exports.Category = CategoryApis.Category

const QuestionsApis = require('./api/Questions')
exports.Questions = QuestionsApis.Questions

const UsersApis = require('./api/Users')
exports.Users = UsersApis.Users
exports.Users = UsersApis.LoginForAdmin

const OffersApis = require('./api/Offers')
exports.Offers = OffersApis.Offers

const CouponsApis = require('./api/Coupons')
exports.Coupons = CouponsApis.Coupons


const CountryApis = require('./api/Country')
exports.Countries = CountryApis.Countries

const UserQuestionApis = require('./api/UserApis/Questions')
exports.UserQuestions = UserQuestionApis.UserQuestions


//=========================Triggers==============================

const CategoryTriggers = require('./triggers/Category')
exports.OnCategoryCreate = CategoryTriggers.OnCategoryCreate
exports.OnCategoryUpdate = CategoryTriggers.OnCategoryUpdate

const QuestionsTriggers = require('./triggers/Questions')
exports.OnQuestionsCreate = QuestionsTriggers.OnQuestionsCreate
exports.OnQuestionsUpdate = QuestionsTriggers.OnQuestionsUpdate


const UsersTriggers = require('./triggers/Users')
exports.OnUsersCreate = UsersTriggers.OnUsersCreate
exports.OnUsersUpdate = UsersTriggers.OnUsersUpdate


