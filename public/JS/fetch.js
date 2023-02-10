var isLoading = false;

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

var thisuserid;

var cookie = document.cookie;
//判斷是否為登入狀態
if ((cookie != "") & (cookie != "token=")) {
  token = cookie.split("=")[1];
} else {
  token = "";
}

if (token != "") {
  console.log("HELLO HERE");

  function parseJwt(token) {
    //decode JWT
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    // console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
  }

  parseJwt(token);

  getData("/api/user/auth");
  function getData(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        // console.log(JSON.parse(this.response));
        login_response = JSON.parse(this.response);
        console.log(login_response["data"]);
        if (login_response["data"] != null) {
          thisuserid = login_response["data"]["userid"];
          console.log(thisuserid);
          console.log("已登入");
          getorigincategorybutton(thisuserid);
          // postcategoryvideo(thisuserid, keyword);
          // const loginitemtext = document.querySelector(".loginitemtext");
          // loginitemtext.innerHTML = "登出系統";
          // const loginitem = document.querySelector("#loginitem");
          // loginitem.onclick = function () {
          //   logout();
          // };
        }
      }
    };
    xhr.send(null);
  }
} else {
  console.log("未登入");
  document.location.href = "/login";
  // let currentUrl = window.location.href + "login";
  // // window.location.replace = "http://127.0.0.1:3030/login";
  // // console.log(currentUrl);
  // window.location.assign(`${currentUrl}`);
  // // const loginitem = document.querySelector("#loginitem");
  // // loginitem.onclick = function () {
  // //   signinblock();
  // // };
}

function getorigincategorybutton(thisuserid) {
  //清空資料
  let rest = document.querySelector(".categoryline");
  rest.innerHTML = "";

  //讀取資料
  isLoading = true;
  console.log(isLoading);
  console.log(thisuserid);

  fetch(`/api/topic?userid=${thisuserid}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //整理
      let array = [];
      let post = data["data"];
      let length = post.length;
      console.log(length);
      for (i = 0; i < length; i++) {
        let posts = data["data"][i];
        console.log(posts["topic"]);
        let topic = posts["topic"];
        //製作新增主題按鈕 //N次
        let line = "categoryline";
        let newbutton = document.getElementsByClassName(line);
        let _button_div = document.createElement("div");
        _button_div.classList.add("categorybutton");
        _button_div.id = i;

        let _categorybutton_inform = document.createElement("div");
        _categorybutton_inform.onclick = function () {
          getcategoryvideo(topic);
        };
        _categorybutton_inform.classList.add("new_categorybutton_inform");
        let _categorybutton_inform_text = document.createTextNode(topic);
        _categorybutton_inform.appendChild(_categorybutton_inform_text);

        //放到位置上
        _button_div.appendChild(_categorybutton_inform);
        newbutton[0].appendChild(_button_div);
      }
      var lasttopic = data["data"][length - 1]["topic"];
      // console.log(data["data"]);
      getcategorybutton();
      postcategoryvideo(thisuserid, lasttopic);
    });
  isLoading = false;
}

function getcategorybutton() {
  //讀取資料
  isLoading = true;
  console.log(isLoading);

  //製作新增主題按鈕 //1次
  let line = "categoryline";
  let newbutton = document.getElementsByClassName(line);
  let _button_div = document.createElement("div");
  _button_div.classList.add("categorybutton");

  let _categorybutton_inform = document.createElement("div");
  _categorybutton_inform.onclick = function () {
    addtopic();
  };
  _categorybutton_inform.classList.add("new_categorybutton_inform");
  let _categorybutton_inform_text = document.createTextNode("＋新增主題");
  _categorybutton_inform.appendChild(_categorybutton_inform_text);

  //放到位置上
  _button_div.appendChild(_categorybutton_inform);
  newbutton[0].appendChild(_button_div);
}

function getnewcategorybutton(keyword) {
  //清空舊資料
  let rest = document.querySelector(".categoryline");
  rest.innerHTML = "";
  console.log(keyword);

  //讀取資料
  isLoading = true;
  console.log(isLoading);

  //製作新增主題按鈕 //1次
  let line = "categoryline";
  let newbutton = document.getElementsByClassName(line);
  let _button_div = document.createElement("div");
  _button_div.classList.add("categorybutton");

  let _categorybutton_inform = document.createElement("div");
  // _categorybutton_inform.onclick = function () {
  //   addtopic();
  // };
  _categorybutton_inform.classList.add("new_categorybutton_inform");

  let _categorybutton_inform_text = document.createTextNode(keyword);
  console.log(keyword);
  _categorybutton_inform.appendChild(_categorybutton_inform_text);

  //放到位置上
  _button_div.appendChild(_categorybutton_inform);
  newbutton[0].appendChild(_button_div);
}

function addtopic() {
  console.log("hi");
  let _searchblock_div = document.querySelector(".searchblock");
  _searchblock_div.style.cssText = "display:block";
  let _blocker_div = document.querySelector(".blocker");
  _blocker_div.style.cssText = "display:block";
}

function hideview() {
  const searchblock_view = document.querySelector(".searchblock");
  searchblock_view.style.display = "none";
  const blocker = document.querySelector(".blocker");
  blocker.style.display = "none";
}

function categoryview() {
  const thetext = document.querySelector(".inputtext");
  thetext.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "flex";
}

// function getcategoryvideo() {
//   // keyword = "五月天";
//   console.log(keyword + "123");
//   // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
//   fetch(`/api/search?keyword=${keyword}`)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       //整理
//       let array = [];
//       for (i = 0; i < 50; i++) {
//         // console.log("---------");
//         // console.log(nextPage);
//         let posts = data["data"][i];
//         // console.log(posts);
//         // let videoId = posts["videoId"];
//         videoId = i;
//         let title = posts["title"];
//         titlelength = title.length;
//         if (titlelength > 32) {
//           title = title.substring(0, 32) + "...";
//         }
//         let coverurl = posts["coverurl"];
//         let channelTitle = posts["channelTitle"];

//         //製作分類影片卡 //跑6次
//         let list = "list-block";
//         let newcard = document.getElementsByClassName(list);
//         let _card_div = document.createElement("div");
//         _card_div.classList.add("card");

//         let _image_container_div = document.createElement("div");
//         _image_container_div.classList.add("image_container");

//         let _photo_div = document.createElement("div");
//         _photo_div.id = videoId;
//         _photo_div.classList.add("photo");
//         _photo_div.style.cssText = "background-image: url(" + coverurl + ")";
//         let _photo_mask = document.createElement("div");
//         _photo_mask.classList.add("photo_mask");
//         let _mask_title = document.createElement("div");
//         _mask_title.id = videoId;
//         _mask_title.classList.add("mask_title");
//         let _newcard_title_text = document.createTextNode(channelTitle);
//         _mask_title.appendChild(_newcard_title_text);

//         let _card_inform = document.createElement("div");
//         _card_inform.classList.add("card_inform");
//         let _video_inform = document.createElement("div");
//         _video_inform.classList.add("video_inform");
//         let _video_inform_text = document.createTextNode(title);
//         _video_inform.appendChild(_video_inform_text);

//         //放到位置上
//         _image_container_div.appendChild(_photo_div);
//         _image_container_div.appendChild(_photo_mask);
//         _image_container_div.appendChild(_mask_title);

//         _card_inform.appendChild(_video_inform);
//         _card_div.appendChild(_image_container_div);
//         _card_div.appendChild(_card_inform);

//         newcard[0].appendChild(_card_div);
//       }
//       console.log(data["data"]);
//     });
//   isLoading = false;
// }
// getcategoryvideo();

function getsearchdata() {
  var newkeyword = document.getElementById("keyword").value;
  console.log(newkeyword);
  keyword = newkeyword;
  postcategoryvideo(thisuserid, newkeyword);
  hideview();
  document.location.href = "/";
}

function postcategoryvideo(thisuserid, lasttopic) {
  //清空舊資料
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  console.log(newkeyword);
  console.log(lasttopic);

  keyword = lasttopic;

  const data = {
    userid: thisuserid,
    keyword: keyword,
  };
  fetch(`/api/search`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        console.log(data["ok"]);
        // signupstate_ok(data);
        console.log(keyword + "!!");
        getcategoryvideo(keyword);
      } else {
        console.log(data["error"]);
        // signupstate_error(data);
      }
    });
  });
}

function getcategoryvideo(keyword) {
  //讀取資料
  isLoading = true;
  console.log(isLoading);
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  console.log(keyword);
  // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
  fetch(`/api/search?keyword=${keyword}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //整理
      let array = [];
      for (i = 0; i < 50; i++) {
        // console.log("---------");
        // console.log(nextPage);
        let posts = data["data"][i];
        // console.log(posts);
        let itemId = posts["itemId"];
        console.log(itemId);
        thisvideoidnumber = i;
        let title = posts["title"];
        titlelength = title.length;
        if (titlelength > 32) {
          title = title.substring(0, 32) + "...";
        }
        let coverurl = posts["coverurl"];
        let channelTitle = posts["channelTitle"];

        //製作分類影片卡 //跑6次
        let list = "list-block";
        let newcard = document.getElementsByClassName(list);
        let _card_div = document.createElement("div");
        _card_div.classList.add("card");

        let _image_container_div = document.createElement("div");
        _image_container_div.classList.add("image_container");

        let _photo_div = document.createElement("div");
        _photo_div.id = thisvideoidnumber;
        _photo_div.classList.add("photo");
        _photo_div.style.cssText = "background-image: url(" + coverurl + ")";
        let _photo_mask = document.createElement("div");
        _photo_mask.classList.add("photo_mask");
        let _mask_title = document.createElement("div");
        _mask_title.id = thisvideoidnumber;
        _mask_title.classList.add("mask_title");
        let _newcard_title_text = document.createTextNode(channelTitle);
        _mask_title.appendChild(_newcard_title_text);

        let _card_inform = document.createElement("div");
        _card_inform.classList.add("card_inform");
        let _video_inform = document.createElement("div");
        _video_inform.classList.add("video_inform");
        let _video_inform_text = document.createTextNode(title);
        _video_inform.appendChild(_video_inform_text);

        //放到位置上
        _image_container_div.appendChild(_photo_div);
        _image_container_div.appendChild(_photo_mask);
        _image_container_div.appendChild(_mask_title);

        _card_inform.appendChild(_video_inform);
        _card_div.appendChild(_image_container_div);
        _card_div.appendChild(_card_inform);

        newcard[0].appendChild(_card_div);
      }
      console.log(data["data"]);
    });
  isLoading = false;
}
// getcategoryvideo();

function gohome() {
  document.location.href = "/";
}

var card = document.getElementsByClassName("card");
window.addEventListener(
  "click",
  function once(e) {
    if (e.target.className == "photo") {
      console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      document.location.href = `/play/${videoId}`;
    } else if (e.target.className == "mask_title") {
      console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      document.location.href = `/play/${videoId}`;
    } else if (e.target.className == "video_inform") {
      console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      document.location.href = `/play/${videoId}`;
    }
  },
  false
);
