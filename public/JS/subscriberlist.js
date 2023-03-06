var isLoading = false;

var nextPage;

var keyword = "@rayduenglish";

var newkeyword = "undefined";

var subscriberkeyword = "undefined";

var thisuserid;

var cookie = document.cookie;

//判斷是否為登入狀態
if ((cookie != "") & (cookie != "token=")) {
  token = cookie.split("=")[1];
} else {
  token = "";
}

if (token != "") {
  // console.log("HELLO HERE");

  function parseJwt(token) {
    // console\.time\("2 的 10 次方花費的時間");
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
    // console.timeEnd("2 的 10 次方花費的時間");
    return JSON.parse(jsonPayload);
  }

  parseJwt(token);

  getData("/api/user/auth");
  function getData(url) {
    // console\.time\("2 的 10 次方花費的時間");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        login_response = JSON.parse(this.response);
        // console.log(login_response["data"]);
        if (login_response["data"] != null) {
          thisuserid = login_response["data"]["userid"];
          thisuserphoto = login_response["data"]["photo"];
          console.log("Hi~~ " + thisuserid);
          console.log(thisuserphoto);
          console.log("已登入");
          getoriginsubscriberbutton(thisuserid);
          memberphoto(thisuserphoto);
        }
      }
    };
    // console.timeEnd("2 的 10 次方花費的時間");
    xhr.send(null);
  }
} else {
  console.log("未登入");
  document.location.href = "/login";
}

function memberphoto(coverurl) {
  if (coverurl == "") {
    coverurl = "/PNG/usercat.png";
  } else {
    coverurl = "https://d10uvafhxfdwto.cloudfront.net/" + coverurl;
  }
  console.log(coverurl);
  let usericon_div = document.querySelector(".usericon");
  usericon_div.style.cssText = "background-image: url(" + coverurl + ")";
}

function logout() {
  // console\.time\("2 的 10 次方花費的時間");
  let cookiedata = parseJwt(token);

  const data = {
    id: cookiedata["id"],
    userid: cookiedata["userid"],
    useremail: cookiedata["useremail"],
  };
  console.log(cookiedata["id"]);
  console.log(cookiedata["userid"]);
  console.log(cookiedata["useremail"]);

  fetch(`/api/user/auth`, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        document.location.href = "/";
      } else if (data["error"] == true) {
        console.log("尚未登出");
      }
    });
  });
  // console.timeEnd("2 的 10 次方花費的時間");
}

function getoriginsubscriberbutton(thisuserid) {
  // console\.time\("2 的 10 次方花費的時間");
  //清空資料
  let rest = document.querySelector(".categoryline");
  rest.innerHTML = "";

  //讀取資料
  isLoading = true;
  // console.log(isLoading);
  console.log(thisuserid);

  fetch(`/api/subscriberlist?userid=${thisuserid}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //整理
      let array = [];
      let post = data["data"];
      // console.log(post);
      let length = post.length;
      // console.log(length);
      for (i = 0; i < length; i++) {
        let posts = data["data"][i];
        // console.log(posts["subscriber"]);
        let subscriber = posts["subscriber"];
        let subscribertitle = posts["subscribertitle"];
        //製作新增主題按鈕 //N次
        let line = "categoryline";
        let newbutton = document.getElementsByClassName(line);
        let _button_div = document.createElement("div");
        _button_div.classList.add("categorybutton");
        _button_div.id = i;

        let _categorybutton_inform = document.createElement("div");
        _categorybutton_inform.onclick = function () {
          getoriginsubscribervideo(thisuserid, subscriber);
        };
        _categorybutton_inform.classList.add("new_categorybutton_inform");
        _categorybutton_inform.id = i;
        let _categorybutton_inform_text = document.createTextNode(
          subscribertitle + "(" + subscriber + ")"
        );
        _categorybutton_inform.appendChild(_categorybutton_inform_text);

        let _categorybutton_close = document.createElement("div");
        _categorybutton_close.classList.add("new_categorybutton_close");
        _categorybutton_close.id = "_close_" + i;
        _categorybutton_close.name = subscriber;

        //放到位置上
        _button_div.appendChild(_categorybutton_inform);
        _button_div.appendChild(_categorybutton_close);
        newbutton[0].appendChild(_button_div);
      }
      if (post.length == 0) {
        let lastsubscriber = "@rayduenglish"; // 預設清單分類為「音樂」
        getcategorybutton();
        postcategoryvideo(thisuserid, lastsubscriber);
        document.location.href = "/subscriberlist";
        // let loadingblocker = document.querySelector(".loadding-blocker");
        // loadingblocker.style.display = "none";
      } else {
        lastsubscriber = data["data"][length - 1]["subscriber"];
        getcategorybutton();
        postcategoryvideo(thisuserid, lastsubscriber);
      }
    });
  isLoading = false;
  // console.timeEnd("2 的 10 次方花費的時間");
}

function getcategorybutton() {
  // console\.time\("2 的 10 次方花費的時間");
  //讀取資料
  isLoading = true;
  // console.log(isLoading);

  //製作新增主題按鈕 //1次
  let line = "categoryline";
  let newbutton = document.getElementsByClassName(line);
  let _button_div = document.createElement("div");
  _button_div.classList.add("categorybutton");

  let _categorybutton_inform = document.createElement("div");
  _categorybutton_inform.onclick = function () {
    addcategory();
  };
  _categorybutton_inform.classList.add("categorybutton_inform");
  let _categorybutton_inform_text = document.createTextNode("＋新增訂閱者");
  _categorybutton_inform.appendChild(_categorybutton_inform_text);

  //放到位置上
  _button_div.appendChild(_categorybutton_inform);
  newbutton[0].appendChild(_button_div);
  // console.timeEnd("2 的 10 次方花費的時間");
}

function addcategory() {
  // console\.time\("2 的 10 次方花費的時間");
  // console.log("hi");
  let _searchblock_div = document.querySelector(".searchblock");
  _searchblock_div.style.cssText = "display:block";
  let _blocker_div = document.querySelector(".blocker");
  _blocker_div.style.cssText = "display:block";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function addvideo() {
  // console\.time\("2 的 10 次方花費的時間");
  // console.log("hi");
  let _searchvideoblock_div = document.querySelector("#searchvideoblock");
  _searchvideoblock_div.style.cssText = "display:block";
  let _blocker_div = document.querySelector(".blocker");
  _blocker_div.style.cssText = "display:block";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function hideview() {
  // console\.time\("2 的 10 次方花費的時間");
  const searchblock_view = document.querySelector(".searchblock");
  searchblock_view.style.display = "none";
  const _searchvideoblock_div = document.querySelector("#searchvideoblock");
  _searchvideoblock_div.style.display = "none";
  const blocker = document.querySelector(".blocker");
  blocker.style.display = "none";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function categoryview() {
  // console\.time\("2 的 10 次方花費的時間");
  const thetext = document.querySelector(".inputtext");
  thetext.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "flex";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function newvideoview() {
  // console\.time\("2 的 10 次方花費的時間");
  const thetext = document.querySelector("#inputvideotext");
  thetext.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "flex";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function newsubscriberview() {
  // console\.time\("2 的 10 次方花費的時間");
  const thetext = document.querySelector("#inputsubscribertext");
  thetext.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "flex";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function getvideolistdata() {
  // console\.time\("2 的 10 次方花費的時間");
  var newkeyword = document.getElementById("keyword").value;
  // console.log(newkeyword);
  keyword = newkeyword;
  postcategoryvideo(thisuserid, newkeyword);
  hideview();
  document.location.href = "/subscriberlist";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function postcategoryvideo(thisuserid, lastsubscriber) {
  // console\.time\("2 的 10 次方花費的時間");
  //清空舊資料
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  // console.log(newkeyword);
  // console.log(lastsubscriber);

  // keyword = lastsubscriber;
  console.log(lastsubscriber);

  // categorykeyword = lastsubscriber;

  const data = {
    userid: thisuserid,
    keyword: lastsubscriber,
  };
  fetch(`/api/subscribervideo`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        // console.log(data["ok"]);
        // console.log(keyword + "!!");
        getoriginsubscribervideo(thisuserid, lastsubscriber);
      } else {
        // console.log(data["error"]);
      }
    });
  });
  // console.timeEnd("2 的 10 次方花費的時間");
}

function getoriginsubscribervideo(thisuserid, keyword) {
  // console\.time\("2 的 10 次方花費的時間");
  //讀取資料
  isLoading = true;
  // console.log(isLoading);
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  // console.log(thisuserid);
  // console.log(keyword);
  // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
  fetch(`/api/subscribervideo?userid=${thisuserid}&keyword=${keyword}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //整理
      let array = [];
      let post = data["data"];
      let length = post.length;

      for (i = 0; i < length; i++) {
        // console.log("---------");
        // console.log(nextPage);
        let posts = data["data"][i];
        // console.log(posts);

        let itemId = posts["itemId"];
        if (itemId["kind"] == "youtube#channel") {
          type = itemId["kind"].split("#")[1];
          tag = itemId["channelId"];
        } else if (itemId["kind"] == "youtube#playlist") {
          type = itemId["kind"].split("#")[1];
          tag = itemId["playlistId"];
        } else if (itemId["kind"] == "youtube#video") {
          type = itemId["kind"].split("#")[1];
          tag = itemId["videoId"];
        }

        console.log(type, tag);
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
        _photo_div.name = type + "/" + tag;

        _photo_div.classList.add("photo");
        _photo_div.style.cssText = "background-image: url(" + coverurl + ")";
        let _photo_mask = document.createElement("div");
        _photo_mask.classList.add("photo_mask");
        let _mask_title = document.createElement("div");
        _mask_title.id = thisvideoidnumber;
        _mask_title.name = type + "/" + tag;
        _mask_title.classList.add("mask_title");
        let _newcard_title_text = document.createTextNode(channelTitle);
        _mask_title.appendChild(_newcard_title_text);

        let _card_inform = document.createElement("div");
        _card_inform.classList.add("card_inform");
        let _video_inform = document.createElement("div");
        _video_inform.classList.add("video_inform");
        _video_inform.id = thisvideoidnumber;
        _video_inform.name = type + "/" + tag;
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
      // console.log(data["data"]);
      // getcategoryvideo();
    });

  isLoading = false;
  let loadingblocker = document.querySelector(".loadding-blocker");
  loadingblocker.style.display = "none";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function deletecategory(deletecategoryid, deletecategoryname) {
  let cookiedata = parseJwt(token);

  const data = {
    id: cookiedata["id"],
    name: cookiedata["name"],
    email: cookiedata["email"],
    subscriberid: deletecategoryid,
    subscribername: deletecategoryname,
  };
  fetch(`/api/subscriberlist`, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        // console.log(data["ok"]);
        document.location.href = "/subscriberlist";
      } else if (data["error"] == true) {
        console.log(data["error"]);
      }
    });
  });
}

function addsubscriberdata() {
  // console\.time\("2 的 10 次方花費的時間" + "0 0");
  // console.log(categorykeyword);

  // console.log(categorykeyword);
  var newkeyword = document.getElementById("subscriberkeyword").value;

  isLoading = true;
  let loadingblocker = document.querySelector(".loadding-blocker");
  loadingblocker.style.display = "block";
  // console.log(newkeyword);
  posttoaddcategoryvideo(thisuserid, newkeyword);
  hideview();
  document.location.href = "/subscriberlist";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function posttoaddcategoryvideo(thisuserid, lastsubscriber) {
  // console\.time\("2 的 10 次方花費的時間");
  //清空舊資料
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  // console.log(newkeyword);
  // console.log(lastsubscriber);

  keyword = lastsubscriber;
  // console.log(categorykeyword);

  if (keyword.includes("@") == true) {
    let str1 = keyword.includes("youtube.com/");

    if (str1 == true) {
      keyword = keyword.split("youtube.com/")[1];
    }
  }

  if (keyword.startsWith("@") == false) {
    let str2 = keyword.includes("youtube.com/channel/");
    let str3 = keyword.includes("/play/channel/");

    if (str2 == true) {
      keyword = keyword.split("www.youtube.com/channel/")[1];
    } else if (str3 == true) {
      keyword = keyword.split("/play/channel/")[1];
    }
  }

  const data = {
    userid: thisuserid,
    keyword: keyword,
  };
  fetch(`/api/subscribervideo`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  }).then(function (response) {
    response.json().then(function (data) {
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        // console.log(data["ok"]);
        // console.log(keyword + "!!");

        // getoriginsubscribervideo(thisuserid, keyword);
        document.location.href = "/subscriberlist";
      } else {
        // console.log(data["error"]);
      }
    });
  });
  // console.timeEnd("2 的 10 次方花費的時間");
}

function gohome() {
  // console\.time\("2 的 10 次方花費的時間");
  document.location.href = "/";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function govideolist() {
  // console\.time\("2 的 10 次方花費的時間");
  document.location.href = "/videolist";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function gosubscriberlist() {
  // console\.time\("2 的 10 次方花費的時間");
  document.location.href = "/subscriberlist";
  // console.timeEnd("2 的 10 次方花費的時間");
}

function gomember() {
  // console\.time\("2 的 10 次方花費的時間");
  document.location.href = "/member";
  // console.timeEnd("2 的 10 次方花費的時間");
}

// console\.time\("2 的 10 次方花費的時間");

var card = document.getElementsByClassName("card");
var card = document.getElementsByClassName("card");
window.addEventListener(
  "click",
  function once(e) {
    if (e.target.className == "photo") {
      // console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      let thisitemtag = e.target.name;
      // console.log(videoId, thisitemtag);
      document.location.href = `/play/${thisitemtag}`;
    } else if (e.target.className == "mask_title") {
      // console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      let thisitemtag = e.target.name;
      // console.log(videoId, thisitemtag);
      document.location.href = `/play/${thisitemtag}`;
    } else if (e.target.className == "video_inform") {
      // console.log("點擊 影片編號" + e.target.id);
      let videoId = e.target.id;
      let thisitemtag = e.target.name;
      // console.log(videoId, thisitemtag);
      document.location.href = `/play/${thisitemtag}`;
    } else if (e.target.className == "new_categorybutton_inform") {
      let _categorybutton_close = document.getElementById(
        "_close_" + e.target.id
      );
      // console.log(_categorybutton_close.style.display);
      if (
        _categorybutton_close.style.display == "" ||
        _categorybutton_close.style.display == "none"
      ) {
        _categorybutton_close.style.display = "block";
      } else {
        _categorybutton_close.style.display = "none";
      }
      // console.log(_categorybutton_close.style.display);
      // console.log(e.target);
      // console.log(e.target.id);
    } else if (e.target.className == "new_categorybutton_close") {
      let deletecategoryid = e.target.id;
      let deletecategoryname = e.target.name;
      deletecategory(deletecategoryid, deletecategoryname);
      // console.log(e.target.id);
      // console.log(e.target.name);
    }
    return subscriberkeyword;
  },
  false
);
// console.timeEnd("2 的 10 次方花費的時間");
