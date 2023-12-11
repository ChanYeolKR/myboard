// /list, /delete, /content, /edit 경로 라우팅

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

// '/list' 경로로의 GET 요청 처리 / 게시글 목록 페이지
router.get("/list", function (req, res) {
    mydb
      .collection("post") // "post" 컬렉션(Table)에서 .find() 찾고 .toArray() 배열로 변환
      .find() 
      .toArray() 
      .then((result) => {
        console.log(result); // 결과를 콘솔에 출력
        res.render("list.ejs", { data: result }); // list.ejs로 {data : result} 결과 데이터 전달하여 렌더링
      });
  });

// '/delete' 경로로의 POST 요청 처리 / 게시글 삭제 처리
router.post("/delete", function (req, res) {
    console.log(req.body);
    req.body._id = new ObjId(req.body._id); // MongoDB 사용이니까 _id, mysql 이었다면 id
    mydb
      .collection("post")  // "post" 컬렉션(Table)에서 .deleteOne() 정해진 문서 삭제
      .deleteOne(req.body)
      .then((result) => {
        console.log("삭제완료"); // 삭제 성공 시 로그 출력
        res.status(200).send(); // 성공 상태 코드 응답 (200번대 정상)
      })
      .catch((err) => {
        console.log(err); // 오류 발생
        res.status(500).send(); // 서버 오류 상태 코드 응답 (500번대 서버오류)
      });
  });

// '/content/:id' 경로로의 GET 요청 처리 / content를 ID별로 나누어 URL주소에 입력하여 구분지어 확인
router.get("/content/:id", function (req, res) {
    console.log(req.params.id);
    req.params.id = new ObjId(req.params.id); // req.params.id 를 ObjectId로 변환
    mydb
      .collection("post")  // "post" 컬렉션(Table)에서 .findOne() 해당 ID를 가진 문서를 찾음
      .findOne({ _id: req.params.id })
      .then((result) => {
        console.log(result);
        res.render("content.ejs", { data: result }); // content.ejs로 {data : result} 결과 데이터 전달하여 렌더링
      });
  });

// '/edit/:id' 경로로의 GET 요청 처리 / edit페이지를 ID별로 나누어 URL주소에 입력하여 구분지어 확인
router.get("/edit/:id", function (req, res) {
    req.params.id = new ObjId(req.params.id); // req.params.id 를 ObjectId로 변환
    mydb
      .collection("post")  // "post" 컬렉션(Table)에서 .findOne() 해당 ID를 가진 문서를 찾음 (위와 동일)
      .findOne({ _id: req.params.id })
      .then((result) => {
        console.log(result);
        res.render("edit.ejs", { data: result }); // edit.ejs로 {data : result} 결과 데이터 전달하여 렌더링
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
router.post('/photo', upload.single('picture'), function(req, res){
   console.log(req.file.path); // 원활한 진행상황 확인을 위해 업로드된 파일의 경로 로그
   imagepath = '\\' + req.file.path; // 업로드된 이미지의 경로를 설정하는 'imagepath' 변수
  });
  

// '/edit' 경로로의 POST 요청 처리 / 게시글 수정 페이지 처리
router.post("/edit", function (req, res) {
    console.log(req.body);
    req.body.id = new ObjId(req.body.id); // req.body.id(수정할 게시물 ID)를 ObjectId로 변환
    let now = new Date();
    mydb
      .collection("post")  // "post" 컬렉션(Table)에서 .updateOne() 해당 ID를 가진 문서를 찾아서 수정
      .updateOne(
        { _id: req.body.id },
        {
          $set: {
            title: req.body.title, // 제목 수정
            content: req.body.content, // 내용 수정
            date: now.toISOString(), // 기존 save 경로와 동일하게 Default 값으로 현재날짜 지정
            path: imagepath, // 업로드된 이미지의 경로를 설정하는 'imagepath' 변수
          },
        }
      )
      .then((result) => {
        console.log("수정완료"); // 수정 성공 시 로그 출력
        res.redirect("/list"); // 수정 완료 후 '/list' 페이지로 전환하여 자연스럽게 구성
      })
      .catch((err) => {
        console.log(err); // 에러 처리
      });
  });

module.exports = router; // 라우터 모듈 내보내기
