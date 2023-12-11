// /login, /logout, /, /signup 경로 라우팅

// 라우트 처리를 위한 Express Router 모듈
var router = require('express').Router(); 

// MongoDB와 연결을 위한 설정
const mongoclient = require("mongodb").MongoClient; // MongoDB 클라이언트
const ObjId = require("mongodb").ObjectId; // MongoDB 문서의 Object ID
const url = "mongodb+srv://root:1234@cluster0.uwfpaji.mongodb.net/?retryWrites=true&w=majority"; // MongoDB 연결 URL

let mydb; // 데이터베이스 인스턴스
// MongoDB에 연결
mongoclient
  .connect(url)
  .then((client) => {
    mydb = client.db("myboard"); // 'myboard' 데이터베이스에 연결
  })
  .catch((err) => {
    console.log(err); // 에러처리
  });
  const sha = require('sha256'); // 비밀번호 암호화를 위한 모듈
  let session = require("express-session"); // Express 세션 미들웨어
  router.use(
    session({
      secret: "dkufe8938493j4e08349u", // 세션의 비밀 키
      resave: false,
      saveUninitialized: true,
    })
  );
  
// '/login' 경로로의 GET 요청 처리 / 로그인 페이지
router.get("/login", function (req, res) {
    if (req.session.user) {
      console.log("세션 유지");
      res.render("index.ejs", { user: req.session.user });
    } else {
      console.log("로그인 페이지");
      res.render("login.ejs");
    }
  });
  
// '/' 경로로의 GET 요청 처리 / 메인 페이지 
  router.get("/", function (req, res) {
    if (req.session.user) {
      console.log("세션 유지");
      res.render("index.ejs", { user: req.session.user });
    } else {
      console.log("user : null");
      res.render("index.ejs", { user: null });
    }
  });
  
  // '/login' 경로로의 POST 요청 처리 / 로그인 처리
  router.post("/login", function (req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " + req.body.userpw);
    mydb
      .collection("account")
      .findOne({ userid: req.body.userid })
      .then((result) => {
        if (result.userpw == sha(req.body.userpw)) {
          req.session.user = req.body;
          console.log("새로운 로그인");
          res.render("index.ejs", { user: req.session.user });
        } else {
          res.render("login.ejs");
        }
      });
  });
  
// '/logout' 경로로의 GET 요청 처리 / 로그아웃 처리
  router.get("/logout", function (req, res) {
    console.log("로그아웃");
    req.session.destroy();
    res.render("index.ejs", { user: null });
  });
  
// '/signup' 경로로의 GET 요청 처리 / 회원가입 페이지 렌더링
  router.get("/signup", function (req, res) {
    res.render("signup.ejs");
  });
  
// '/signup' 경로로의 POST 요청 처리 / 회원가입 처리
  router.post("/signup", function (req, res) {
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);
  
    mydb
      .collection("account")
      .insertOne({
        userid: req.body.userid,
        userpw: sha(req.body.userpw),
        usergroup: req.body.usergroup,
        useremail: req.body.useremail,
      })
      .then((result) => {
        console.log("회원가입 성공");
      });
    res.redirect("/");
  });
  
  module.exports = router; // 라우터 모듈 내보내기