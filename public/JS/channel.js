var isLoading = true;

let loadingblocker = document.querySelector(".loadding-blocker");
loadingblocker.style.display = "flex";

var nextPage;

var keyword = "蘋果發表會";

var newkeyword = "undefined";

var cookie = document.cookie;

var thisitemId = window.location.href.split("/play/channel/")[1];
console.log(thisitemId);
//判斷是否為登入狀態
if ((cookie != "") & (cookie != "token=")) {
  token = cookie.split("=")[1];
} else {
  token = "";
}

if (token != "") {
  isLoading = true;
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
          console.log("已登入");
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
  isLoading = false;
} else {
  console.log("未登入");
  // document.location.href = "/login";
  // cookiedata["id"] = "22";
  // cookiedata["userid"] = "introduction";
  // cookiedata["useremail"] = "introduction";
}

function gohome() {
  document.location.href = "/";
}

function gomember() {
  console.time("2 的 10 次方花費的時間");
  document.location.href = "/member";
  console.timeEnd("2 的 10 次方花費的時間");
}

// // Load the IFrame Player API code asynchronously
// var tag = document.createElement("script");
// tag.src = "https://www.youtube.com/player_api";
// var firstScriptTag = document.getElementsByTagName("script")[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// // Replace the 'ytplayer' element with an <iframe> and
// // YouTube player after the API code downloads.
// var player;
// function onYouTubePlayerAPIReady() {
//   player = new YT.Player("ytplayer", {
//     height: "360",
//     width: "640",
//     videoId: thisitemId,
//   });
// }

function getchannel(thisitemId) {
  console.time("2 的 10 次方花費的時間");
  //讀取資料
  isLoading = true;
  // // console.log(isLoading);
  // let rest = document.querySelector(".list-block");
  // rest.innerHTML = "";
  // // console.log(keyword);
  // // const keyword = document.getElementById("keyword").value; //查詢關鍵字 的輸入值
  fetch(`/api/channel?channel=${thisitemId}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data["data"]);
      console.log(data["data"][0]["channelTitle"]);
      console.log(data["data"][0]["publishedAt"]);

      let post = data["data"][0];
      let channelTitle = post["channelTitle"];
      let description = post["description"];
      let thumbnailUrl = post["thumbnailUrl"];
      let customUrl = post["customUrl"];
      let publishedAt = post["publishedAt"].split("T")[0];
      let subscriberCount = parseInt(post["subscriberCount"]);
      // console.log(typeof subscriberCount);
      if (subscriberCount >= 10000) {
        subscriberCount = subscriberCount / 10000 + "萬位 訂閱者";
      }
      let viewCount =
        parseInt(post["viewCount"]).toLocaleString() + "次 觀看數";
      // console.log(viewCount);
      let videoCount =
        parseInt(post["videoCount"]).toLocaleString() + "部 影片";

      let ytchannelmenu_div = document.querySelector(".ytchannelmenu");
      let ytchannelmenu_block_div = document.createElement("div");
      ytchannelmenu_block_div.classList.add("ytchannelmenublock");
      ytchannelmenu_block_div.id = customUrl;

      let ytchannelmenu_block_left_div = document.createElement("div");
      ytchannelmenu_block_left_div.classList.add("ytchannelmenublock-left");
      let ytchannel_cover_div = document.createElement("div");
      ytchannel_cover_div.classList.add("ytchannel_cover_div");
      ytchannel_cover_div.style.cssText =
        "background-image: url(" + thumbnailUrl + ")";

      let ytchannelmenu_block_right_div = document.createElement("div");
      ytchannelmenu_block_right_div.classList.add("ytchannelmenublock-right");

      let ytchannel_titlewithcustomUrl_div = document.createElement("div");
      ytchannel_titlewithcustomUrl_div.classList.add(
        "ytchannel_titlewithcustomUrl_div"
      );
      let ytchannel_title_div = document.createElement("div");
      ytchannel_title_div.classList.add("ytchannel_title_div");
      let ytchannel_title_div_text = document.createTextNode(channelTitle);
      ytchannel_title_div.appendChild(ytchannel_title_div_text);
      let ytchannel_customUrl_div = document.createElement("div");
      ytchannel_customUrl_div.classList.add("ytchannel_customUrl_div");
      let ytchannel_customUrl_div_text = document.createTextNode(customUrl);
      ytchannel_customUrl_div.appendChild(ytchannel_customUrl_div_text);

      let ytchannel_statistics_div = document.createElement("div");
      ytchannel_statistics_div.classList.add("ytchannel_statistics_div");

      let ytchannel_subscriberCount_div = document.createElement("div");
      ytchannel_subscriberCount_div.classList.add(
        "ytchannel_subscriberCount_div"
      );
      let ytchannel_subscriberCount_div_img = document.createElement("img");
      ytchannel_subscriberCount_div_img.classList.add(
        "ytchannel_subscriberCount_div_img"
      );
      const ytchannel_subscriberCount_div_img_attr =
        document.createAttribute("src");
      ytchannel_subscriberCount_div_img_attr.value = "/PNG/subscriber.png";
      ytchannel_subscriberCount_div_img.setAttributeNode(
        ytchannel_subscriberCount_div_img_attr
      );
      let ytchannel_subscriberCount_div_text =
        document.createTextNode(subscriberCount);
      ytchannel_subscriberCount_div.appendChild(
        ytchannel_subscriberCount_div_img
      );
      ytchannel_subscriberCount_div.appendChild(
        ytchannel_subscriberCount_div_text
      );

      ytchannel_statistics_div.appendChild(ytchannel_subscriberCount_div);

      let ytchannel_viewCount_div = document.createElement("div");
      ytchannel_viewCount_div.classList.add("ytchannel_viewCount_div");
      let ytchannel_viewCount_div_img = document.createElement("img");
      ytchannel_viewCount_div_img.classList.add("ytchannel_viewCount_div_img");
      const ytchannel_viewCount_div_img_attr = document.createAttribute("src");
      ytchannel_viewCount_div_img_attr.value = "/PNG/view.png";
      ytchannel_viewCount_div_img.setAttributeNode(
        ytchannel_viewCount_div_img_attr
      );
      let ytchannel_viewCount_div_text = document.createTextNode(viewCount);
      ytchannel_viewCount_div.appendChild(ytchannel_viewCount_div_img);
      ytchannel_viewCount_div.appendChild(ytchannel_viewCount_div_text);
      ytchannel_statistics_div.appendChild(ytchannel_viewCount_div);

      let ytchannel_videoCount_div = document.createElement("div");
      ytchannel_videoCount_div.classList.add("ytchannel_videoCount_div");
      let ytchannel_videoCount_div_img = document.createElement("img");
      ytchannel_videoCount_div_img.classList.add(
        "ytchannel_videoCount_div_img"
      );
      const ytchannel_videoCount_div_img_attr = document.createAttribute("src");
      ytchannel_videoCount_div_img_attr.value = "/PNG/video.png";
      ytchannel_videoCount_div_img.setAttributeNode(
        ytchannel_videoCount_div_img_attr
      );
      let ytchannel_videoCount_div_text = document.createTextNode(videoCount);
      ytchannel_videoCount_div.appendChild(ytchannel_videoCount_div_img);
      ytchannel_videoCount_div.appendChild(ytchannel_videoCount_div_text);
      ytchannel_statistics_div.appendChild(ytchannel_videoCount_div);

      let ytchannel_description_div = document.createElement("div");
      ytchannel_description_div.classList.add("ytchannel_description_div");
      let ytchannel_description_div_text = document.createTextNode(description);
      ytchannel_description_div.appendChild(ytchannel_description_div_text);

      let ytchannel_publishedAt_div = document.createElement("div");
      ytchannel_publishedAt_div.classList.add("ytchannel_publishedAt_div");
      let ytchannel_publishedAt_div_img = document.createElement("img");
      ytchannel_publishedAt_div_img.classList.add(
        "ytchannel_publishedAt_div_img"
      );
      const ytchannel_publishedAt_div_img_attr =
        document.createAttribute("src");
      ytchannel_publishedAt_div_img_attr.value = "/PNG/report.png";
      ytchannel_publishedAt_div_img.setAttributeNode(
        ytchannel_publishedAt_div_img_attr
      );
      let publishedAt_year = publishedAt.split("-")[0];
      let publishedAt_month = publishedAt.split("-")[1];
      let publishedAt_day = publishedAt.split("-")[2];
      let ytchannel_publishedAt_div_text = document.createTextNode(
        publishedAt_year +
          "年" +
          publishedAt_month +
          "月" +
          publishedAt_day +
          "日" +
          " 建立頻道"
      );
      ytchannel_publishedAt_div.appendChild(ytchannel_publishedAt_div_img);
      ytchannel_publishedAt_div.appendChild(ytchannel_publishedAt_div_text);

      ytchannelmenu_block_left_div.appendChild(ytchannel_cover_div);

      ytchannel_titlewithcustomUrl_div.appendChild(ytchannel_title_div);
      ytchannel_titlewithcustomUrl_div.appendChild(ytchannel_customUrl_div);

      ytchannelmenu_block_right_div.appendChild(
        ytchannel_titlewithcustomUrl_div
      );

      ytchannelmenu_block_right_div.appendChild(ytchannel_statistics_div);
      ytchannelmenu_block_right_div.appendChild(ytchannel_description_div);
      ytchannelmenu_block_right_div.appendChild(ytchannel_publishedAt_div);

      ytchannelmenu_block_div.appendChild(ytchannelmenu_block_left_div);
      ytchannelmenu_block_div.appendChild(ytchannelmenu_block_right_div);

      ytchannelmenu_div.appendChild(ytchannelmenu_block_div);

      // let videoId = data["data"]["videoId"];
      // getchannelvideo(videoId);
    });
  isLoading = false;
  let loadingblocker = document.querySelector(".loadding-blocker");
  loadingblocker.style.display = "none";
  console.timeEnd("2 的 10 次方花費的時間");
}

getchannel(thisitemId);

function logout() {
  console.time("2 的 10 次方花費的時間");
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
  console.timeEnd("2 的 10 次方花費的時間");
}
