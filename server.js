// dotenv 모듈을 사용하여 환경 변수 로드
const dotenv = require('dotenv').config();

// MongoDB 클라이언트 및 ObjectId 가져오기
const mongoclient = require("mongodb").MongoClient;
const ObjId = require("mongodb").ObjectId;

// MongoDB 연결 URL
const url = "mongodb+srv://root:1234@cluster0.uwfpaji.mongodb.net/?retryWrites=true&w=majority";

let mydb;

// MongoDB 연결
mongoclient
  .connect(url)
  .then((client) => {
    // MongoDB 클라이언트로부터 데이터베이스 얻기
    mydb = client.db("myboard");

    // 서버 시작
    app.listen(8080, function () {
      console.log("포트 8080으로 서버 대기중 ... ");
    });
  })
  .catch((err) => {
    console.log(err);
  });

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// 뷰 엔진으로 EJS 사용 설정
app.set("view engine", "ejs");

// 정적 파일을 제공하기 위해 express.static 사용
app.use("/public", express.static("public"));

// 가독성 및 편의성을 위해 라우터를 사용하여 코드 기능 별로 분류
app.use('/', require('./routes/post.js')) // 게시물 관련 라우터
app.use('/', require('./routes/add.js')) // 추가 관련 라우터
app.use('/', require('./routes/auth.js')) // 인증 관련 라우터

let cookieParser = require("cookie-parser");

// 쿠키 파서 사용
app.use(cookieParser("ncvka0e398423kpfd"));

  // 'search' 경로로의 GET 요청 처리 / 검색 기능 구현
app.get('/search', function(req, res){
  console.log(req.query);

  // MongoDB에서 title이 req.query.value와 일치하는 데이터 검색
  mydb
    .collection("post")
    .find({ title: req.query.value })
    .toArray()
    .then((result) => {
      console.log(result);
      // sresult.ejs 뷰 템플릿에 결과 데이터 전달하여 렌더링
      res.render("sresult.ejs", { data: result });
    });
});


let imagepath = ''; // 업로드된 이미지의 경로를 설정하는 'imagepath' 변수
let multer = require('multer'); // 파일 업로드를 위해 사용되는 미들웨어

let storage = multer.diskStorage({
  destination : function(req, file, done){
    done(null, './public/image'); // 업로드된 파일의 대상 디렉터리 설정
  },
  filename : function(req, file, done){
    done(null, file.originalname); // 업로드된 파일의 파일명 설정
  }
});

let upload = multer({storage : storage}); // 설정된 저장 옵션으로 multer 구성

// '/photo' 경로로의 POST 요청 처리 / 이미지 업로드 처리
app.post('/photo', upload.single('picture'), function(req, res){
 console.log(req.file.path); // 원활한 진행상황 확인을 위해 업로드된 파일의 경로 로그
 imagepath = '\\' + req.file.path; // 업로드된 이미지의 경로를 설정하는 'imagepath' 변수
});


  // '/save' 경로로의 POST 요청 처리 / 게시글 저장 기능 구현
app.post("/save", async function (req, res) {
  try {  // 에러처리를 위한 try catch문 활용


    console.log(req.body.title); // req에서 받은 title
    console.log(req.body.content); // req에서 받은 content
    console.log(req.session.user); // req에서 받은 user (다른 데이터와 달리 body가 아니라 session에 저장되어 있음)
    let now = new Date();
    console.log(req.body.someDate); // req에서 받은 someDate

    // MongoDB 'post' 컬렉션에 데이터 삽입
    const result = await mydb.collection("post").insertOne({
      userid: req.session.user.userid, // 게시글 저장 시 어느 사용자의 게시글인지 구분하기 위해 userid 데이터 추가 삽입
      title: req.body.title,
      content: req.body.content,
      date: now.toISOString(), // 게시글 저장 시 날짜값을 입력하지 않아도 자동으로 현재 날짜가 입력되는 기능
      path: imagepath, // 업로드된 이미지의 경로를 설정하는 'imagepath' 변수
    });

    console.log(result); // 진행 상황을 알 수 있도록 콘솔창 출력
    console.log("데이터 추가 성공"); // 성공 메시지 로그

    res.redirect("/list"); // '/list' 경로로 리다이렉트하여 페이지 전환을 자연스럽게 설정
  } catch (error) {
    // 에러 발생 시 사용자에게 에러 메시지 출력
    console.error(error); // 콘솔에 에러 로그 출력

    // 사용자에게 에러 메시지 출력
    res.status(500).send("사용자 에러입니다. 등록된 사용자로 로그인 해주세요.");  // 로그인 하지 않은상태의 익명 사용자가 글을 쓰려고 하면 에러처리
  }
});