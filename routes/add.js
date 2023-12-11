// /enter, /upload 경로 라우팅

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

// '/enter' 경로로의 GET 요청 처리 / 게시글쓰기 페이지
router.get("/enter", function (req, res) {
    res.render("enter.ejs"); // 'enter.ejs' 로 렌더링
});


// '/upload' 경로로의 GET 요청 처리 / 파일 업로드 처리 페이지
router.get('/upload', function(req, res){
  res.render('upload.ejs'); // 'upload.ejs' 로 렌더링
});



// '/add-friend' 경로로의 GET 요청처리  / 친구 추가 기능 페이지
router.get('/add-friend', (req, res) => {
  res.render('add-friend'); // 'add-friend.ejs'로 렌더링
});

// 친구 추가 처리
router.post('/add-friend', (req, res) => {
  const friendName = req.body.friendName; // 폼으로부터 입력된 친구 이름과 이메일

  mydb.collection('friends').insertOne({ name: friendName }, (err, result) => {
    if (err) {
      console.error('친구 추가 실패:', err);
      res.status(500).send('친구 추가에 실패했습니다.');
    } else {
      console.log('친구 추가 완료:', result.insertedId);
    }
    res.redirect('/friends'); // 친구 추가 후 친구 목록 페이지로 리다이렉트합니다.
  });
});

router.get('/friends', (req, res) => {
  mydb.collection('friends').find().toArray((err, result) => {
    if (err) {
      console.error('친구 목록을 가져오는 중 에러:', err);
      res.status(500).send('친구 목록을 가져오는 데 문제가 발생했습니다.');
    } else {
      res.render('friends', { friends: result }); // 'friends.ejs' 템플릿에 친구 목록 전달
    }
  });
});
module.exports = router; // 라우터 모듈 내보내기
