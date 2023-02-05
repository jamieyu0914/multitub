var isLoading = false;

var nextPage;

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
} else {
  console.log("未登入");
  // let currentUrl = window.location.href + "login";
  // window.location.replace = currentUrl;
  // console.log(currentUrl);
  // const loginitem = document.querySelector("#loginitem");
  // loginitem.onclick = function () {
  //   signinblock();
  // };
}

function gohome() {
  document.location.href = "/";
}

function signinblock() {
  const signupblock = document.querySelector(".signupblock");
  signupblock.style.display = "none";

  const signinblock = document.querySelector(".signinblock");
  signinblock.style.display = "block";

  const blocker = document.querySelector(".blocker");
  blocker.style.cssText =
    "background-color: #000000; display: flex; opacity: 0.25; z-index: 998;";
}

function signinemailtext() {
  const signinemailtext = document.querySelector(".signinemailtext");
  signinemailtext.style.display = "none";
}

function signinpasswordtext() {
  const signinpasswordtext = document.querySelector(".signinpasswordtext");
  signinpasswordtext.style.display = "none";
}

function signinblock_close() {
  const signinblock = document.querySelector(".signinblock");
  signinblock.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "none";
}

function signupblock() {
  const signinblock = document.querySelector(".signinblock");
  signinblock.style.display = "none";

  const signupblock = document.querySelector(".signupblock");
  signupblock.style.display = "block";

  const blocker = document.querySelector(".blocker");
  blocker.style.cssText =
    "background-color: #000000; display: flex; opacity: 0.25; z-index: 998;";
}

function signupnametext() {
  const signupnametext = document.querySelector(".signupnametext");
  signupnametext.style.display = "none";
}

function signupemailtext() {
  const signupemailtext = document.querySelector(".signupemailtext");
  signupemailtext.style.display = "none";
}

function signuppasswordtext() {
  const signuppasswordtext = document.querySelector(".signuppasswordtext");
  signuppasswordtext.style.display = "none";
}

function signupblock_close() {
  const signupblock = document.querySelector(".signupblock");
  signupblock.style.display = "none";

  const blocker = document.querySelector(".blocker");
  blocker.style.display = "none";
}

var message;

function signup() {
  const signupname = document.getElementById("signupname").value;
  const signupemail = document.getElementById("signupemail").value;
  const signuppassword = document.getElementById("signuppassword").value;
  const data = {
    userid: signupname,
    useremail: signupemail,
    password: signuppassword,
  };
  fetch(`/api/user`, {
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
        signupstate_ok(data);
      } else {
        console.log(data["error"]);
        signupstate_error(data);
      }
    });
  });

  function signupstate_ok(data) {
    let signupblock = document.querySelector(".signupblock");
    signupblock.style.cssText = "height:370px; display:block;";
    let newresult = document.querySelector(".newresult");
    newresult.innerHTML = "";
    let content = document.createTextNode("註冊成功，請登入系統");
    newresult.style.cssText = "color:green";
    let clicktosignin = document.querySelector(".clicktosignin");
    clicktosignin.style.cssText = "top:256px";
    newresult.appendChild(content);
    document.location.href = "/";
  } // 註冊會員 結果欄位 成功

  function signupstate_error(data) {
    let signupblock = document.querySelector(".signupblock");
    signupblock.style.cssText = "height:370px; display:block;";
    let newresult = document.querySelector(".newresult");
    newresult.innerHTML = "";
    let content = document.createTextNode(message);
    newresult.style.cssText = "color:red";
    let clicktosignin = document.querySelector(".clicktosignin");
    clicktosignin.style.cssText = "top:256px";
    newresult.appendChild(content);
  } // 註冊會員 結果欄位 失敗
}

function signinput() {
  const signinemail = document.getElementById("signinemail").value;
  const signinpassword = document.getElementById("signinpassword").value;
  const data = {
    useremail: signinemail,
    password: signinpassword,
  };
  fetch(`/api/user/auth`, {
    method: "PUT",
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
        signinstate_ok(data);
        // let cookie = document.cookie;
        // console.log(cookie);
      } else if (data["error"] == true) {
        console.log(data["error"]);
        signinstate_error(data);
      }
    });
  });

  function signinstate_ok(data) {
    let signinblock = document.querySelector(".signinblock");
    signinblock.style.cssText = "height:310px; display:block;";
    let theresult = document.querySelector(".theresult");
    theresult.innerHTML = "";
    let content = document.createTextNode("登入成功");
    theresult.style.cssText = "color:green";
    let clicktosignup = document.querySelector(".clicktosignup");
    clicktosignup.style.cssText = "top:196px";
    theresult.appendChild(content);
    document.location.href = "/";
  } // 登入會員 結果欄位 成功

  function signinstate_error(data) {
    let signinblock = document.querySelector(".signinblock");
    signinblock.style.cssText = "height:310px; display:block;";
    let theresult = document.querySelector(".theresult");
    theresult.innerHTML = "";
    let content = document.createTextNode(message);
    theresult.style.cssText = "color:red";
    let clicktosignup = document.querySelector(".clicktosignup");
    clicktosignup.style.cssText = "top:196px";
    theresult.appendChild(content);
  } // 登入會員 結果欄位 失敗
}

// function logout() {
//   let cookiedata = parseJwt(token);

//   const data = {
//     id: cookiedata["id"],
//     userid: cookiedata["userid"],
//     useremail: cookiedata["useremail"],
//   };
//   fetch(`/api/user/auth`, {
//     method: "DELETE",
//     body: JSON.stringify(data),
//     headers: {
//       "Content-type": "application/json",
//     },
//   }).then(function (response) {
//     response.json().then(function (data) {
//       console.log(data);
//       message = data["message"];
//       if (data["ok"] == true) {
//         console.log(data["ok"]);
//         document.location.href = "/";
//         signoutstate_ok(data);
//         // let cookie = document.cookie;
//         // console.log(cookie);
//       } else if (data["error"] == true) {
//         console.log(data["error"]);
//         signoutstate_error(data);
//       }
//     });
//   });

//   function signoutstate_ok(data) {
//     console.log("已登出");
//     const loginitemtext = document.querySelector(".loginitemtext");
//     loginitemtext.innerHTML = "登入/註冊";
//     // const loginitem = document.querySelector("#loginitem");
//     // loginitem.onclick = function () {
//     //   signinblock();
//     // };
//   } // 登出會員 成功

//   function signoutstate_error(data) {
//     console.log("未登出");
//     const loginitemtext = document.querySelector(".loginitemtext");
//     loginitemtext.innerHTML = "登出系統";
//     const loginitem = document.querySelector("#loginitem");
//     loginitem.onclick = function () {
//       logout();
//     };
//   } // 登出會員 失敗
// }
