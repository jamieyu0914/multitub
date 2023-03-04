var isLoading = false;

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

var thisuserid;

var cookie = document.cookie;

var thisuserid = "introduction";
getorigincategorybutton(thisuserid);

function loginandout() {
  console.time("2 的 10 次方花費的時間");
  document.location.href = "/login";
  console.timeEnd("2 的 10 次方花費的時間");
}

function getorigincategorybutton(thisuserid) {
  console.time("2 的 10 次方花費的時間");
  //清空資料
  let rest = document.querySelector(".categoryline");
  rest.innerHTML = "";

  //讀取資料
  isLoading = true;
  // console.log(isLoading);
  console.log(thisuserid);

  fetch(`/api/topic?userid=${thisuserid}`)
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
        // console.log(posts["topic"]);
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
        _categorybutton_inform.id = i;
        let _categorybutton_inform_text = document.createTextNode(topic);
        _categorybutton_inform.appendChild(_categorybutton_inform_text);

        let _categorybutton_close = document.createElement("div");
        _categorybutton_close.classList.add("new_categorybutton_close");
        _categorybutton_close.id = "_close_" + i;
        _categorybutton_close.name = topic;

        //放到位置上
        _button_div.appendChild(_categorybutton_inform);
        _button_div.appendChild(_categorybutton_close);
        newbutton[0].appendChild(_button_div);
      }
      if (post.length == 0) {
        var lasttopic = "蘋果發表會"; // 預設關鍵字為「蘋果發表會」
        getcategorybutton();
        postcategoryvideo(thisuserid, lasttopic);
        document.location.href = "/";
      } else {
        lasttopic = data["data"][length - 1]["topic"];
        getcategorybutton();
        postcategoryvideo(thisuserid, lasttopic);
      }
    });
  isLoading = false;
  console.timeEnd("2 的 10 次方花費的時間");
}

function getcategorybutton() {
  console.time("2 的 10 次方花費的時間");
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
    loginandout();
    // addtopic();
  };
  _categorybutton_inform.classList.add("categorybutton_inform");
  let _categorybutton_inform_text = document.createTextNode("＋新增主題");
  _categorybutton_inform.appendChild(_categorybutton_inform_text);

  //放到位置上
  _button_div.appendChild(_categorybutton_inform);
  newbutton[0].appendChild(_button_div);
  console.timeEnd("2 的 10 次方花費的時間");
}

function addtopic() {
  console.time("2 的 10 次方花費的時間");
  // console.log("hi");
  let _searchblock_div = document.querySelector(".searchblock");
  _searchblock_div.style.cssText = "display:block";
  let _blocker_div = document.querySelector(".blocker");
  _blocker_div.style.cssText = "display:block";
  console.timeEnd("2 的 10 次方花費的時間");
}

function hideview() {
  console.time("2 的 10 次方花費的時間");
  const searchblock_view = document.querySelector(".searchblock");
  searchblock_view.style.display = "none";
  const blocker = document.querySelector(".blocker");
  blocker.style.display = "none";
  console.timeEnd("2 的 10 次方花費的時間");
}

function categoryview() {
  console.time("2 的 10 次方花費的時間");
  const thetext = document.querySelector(".inputtext");
  thetext.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "flex";
  console.timeEnd("2 的 10 次方花費的時間");
}

function getsearchdata() {
  console.time("2 的 10 次方花費的時間");
  var newkeyword = document.getElementById("keyword").value;
  // console.log(newkeyword);
  keyword = newkeyword;
  postcategoryvideo(thisuserid, newkeyword);
  hideview();
  document.location.href = "/";
  console.timeEnd("2 的 10 次方花費的時間");
}

function postcategoryvideo(thisuserid, lasttopic) {
  console.time("2 的 10 次方花費的時間");
  //清空舊資料
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  // console.log(newkeyword);
  // console.log(lasttopic);

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
      // console.log(data);
      message = data["message"];
      if (data["ok"] == true) {
        // console.log(data["ok"]);

        // console.log(keyword + "!!");
        getcategoryvideo(keyword);
      } else {
        // console.log(data["error"]);
      }
    });
  });
  console.timeEnd("2 的 10 次方花費的時間");
}

function getcategoryvideo(keyword) {
  console.time("2 的 10 次方花費的時間");
  //讀取資料
  isLoading = true;
  // console.log(isLoading);
  let rest = document.querySelector(".list-block");
  rest.innerHTML = "";
  // console.log(keyword);
  // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
  fetch(`/api/search?keyword=${keyword}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //整理
      let array = [];
      for (i = 0; i < 12; i++) {
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
        // console.log(type, tag);
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
    });
  isLoading = false;
  let loadingblocker = document.querySelector(".loadding-blocker");
  loadingblocker.style.display = "none";
  console.timeEnd("2 的 10 次方花費的時間");
}

function deletetopic(deletetopicid, deletetopicname) {
  const data = {
    id: "22",
    name: "introduction",
    email: "introduction",
    topicid: deletetopicid,
    topicname: deletetopicname,
  };
  fetch(`/api/topic`, {
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
        document.location.href = "/";
      } else if (data["error"] == true) {
        console.log(data["error"]);
      }
    });
  });
}

function gohome() {
  console.time("2 的 10 次方花費的時間");
  document.location.href = "/";
  console.timeEnd("2 的 10 次方花費的時間");
}

function bannerclose() {
  console.time("2 的 10 次方花費的時間");
  let sloganbanner_div = document.querySelector(".sloganbanner");
  sloganbanner_div.style.cssText = "display:none";
  console.timeEnd("2 的 10 次方花費的時間");
}

function introductiontopiclist() {
  console.time("2 的 10 次方花費的時間");
  let view_right_div = document.getElementById("view-right");
  view_right_div.style.cssText = "display:none";

  let _introductioncard_div = document.querySelector(".introductioncard");
  _introductioncard_div.style.cssText = "display:flex;";

  let _introductioncard_photo_div = document.querySelector(
    ".introductioncard_photo"
  );
  _introductioncard_photo_div.style.cssText =
    "background-image: url(/PNG/topicmark.png)";

  let introductioncard_title_div = document.querySelector(
    ".introductioncard_title"
  );
  introductioncard_title_div.innerHTML = "盡情欣賞你所關注的主題內容";

  let introductioncard_information_div = document.querySelector(
    ".introductioncard_information"
  );
  introductioncard_information_div.innerHTML =
    "登入後即可查看你關注或紀錄的主題內容";

  let introductioncard_loginandout_div = document.querySelector(
    ".introductioncard_loginandout"
  );
  introductioncard_loginandout_div.innerHTML = "登入/註冊";
  console.timeEnd("2 的 10 次方花費的時間");
}

function introductionvideolist() {
  console.time("2 的 10 次方花費的時間");
  let view_right_div = document.getElementById("view-right");
  view_right_div.style.cssText = "display:none";

  let _introductioncard_div = document.querySelector(".introductioncard");
  _introductioncard_div.style.cssText = "display:flex;";

  let _introductioncard_photo_div = document.querySelector(
    ".introductioncard_photo"
  );
  _introductioncard_photo_div.style.cssText =
    "background-image: url(/PNG/video.png)";

  let introductioncard_title_div = document.querySelector(
    ".introductioncard_title"
  );
  introductioncard_title_div.innerHTML = "盡情觀看你最喜愛的影片";

  let introductioncard_information_div = document.querySelector(
    ".introductioncard_information"
  );
  introductioncard_information_div.innerHTML =
    "登入後即可查看你喜歡或儲存的影片";

  let introductioncard_loginandout_div = document.querySelector(
    ".introductioncard_loginandout"
  );
  introductioncard_loginandout_div.innerHTML = "登入/註冊";
  console.timeEnd("2 的 10 次方花費的時間");
}

function introductionsubscriberlist() {
  console.time("2 的 10 次方花費的時間");
  let view_right_div = document.getElementById("view-right");
  view_right_div.style.cssText = "display:none";

  let _introductioncard_div = document.querySelector(".introductioncard");
  _introductioncard_div.style.cssText = "display:flex;";

  let _introductioncard_photo_div = document.querySelector(
    ".introductioncard_photo"
  );
  _introductioncard_photo_div.style.cssText =
    "background-image: url(/PNG/subscriber.png)";

  let introductioncard_title_div = document.querySelector(
    ".introductioncard_title"
  );
  introductioncard_title_div.innerHTML = "別錯過訂閱者新發布的影片";
  console.timeEnd("2 的 10 次方花費的時間");

  let introductioncard_information_div = document.querySelector(
    ".introductioncard_information"
  );
  introductioncard_information_div.innerHTML =
    "登入後即可查看你最喜愛的 YouTube 頻道的最新動態";

  let introductioncard_loginandout_div = document.querySelector(
    ".introductioncard_loginandout"
  );
  introductioncard_loginandout_div.innerHTML = "登入/註冊";
}

function gomember() {
  console.time("2 的 10 次方花費的時間");
  document.location.href = "/member";
  console.timeEnd("2 的 10 次方花費的時間");
}

console.time("2 的 10 次方花費的時間");
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
      loginandout();
      // let deletetopicid = e.target.id;
      // let deletetopicname = e.target.name;
      // deletetopic(deletetopicid, deletetopicname);
      // console.log(e.target.id);
      // console.log(e.target.name);
    }
  },
  false
);
console.timeEnd("2 的 10 次方花費的時間");
