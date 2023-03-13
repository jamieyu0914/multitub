from flask import Flask 
from flask import request 
from flask import Response
from flask import redirect 
from flask import render_template
from flask import make_response 
from flask import session
from flask import jsonify
from fastapi import FastAPI
from mysql.connector import Error
from mysql.connector import pooling
import json
import requests
import jwt
import time
import datetime
from dotenv import load_dotenv
import os
import requests
import pprint
import argparse
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from flask import Flask, request, send_from_directory, jsonify
import boto3
from datetime import datetime
import random
from flasgger import Swagger
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint

#github actions test6

load_dotenv()

options = ["YOUTUBE_KEY_DEVELOPER_KEY", "YOUTUBE_KEY_DEVELOPER_KEY_I", "YOUTUBE_KEY_DEVELOPER_KEY_II"]


DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

connection_pool = pooling.MySQLConnectionPool(pool_name="my_connection_pool",
                                                pool_size=5,
                                                pool_reset_session=True,
                                                host=DATABASE_HOST,
                                                database=DATABASE_NAME,
                                                user=DATABASE_USER,
                                                password=DATABASE_PASSWORD)

app = FastAPI()

app=Flask(__name__,
    static_folder="public",
    static_url_path="/") #建立 Application 物件)
app.secret_key="any string but secret" #設定 Session 的密鑰    
app.config["JSON_AS_ASCII"]=False
app.config["JSON_SORT_KEYS"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["UPLOAD_FOLDER"] = "uploads"


#設定 Swagger
CORS(app)
Swagger(app)

@app.route("/static/<path:path>")
def send_static(path):
	return send_from_directory('static', path)

SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': 'MultiTube'
        }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


# 設定Amazon S3連線資訊
BUCKET_NAME = os.getenv("BUCKET_NAME")
BUCKET_REGION = os.getenv("BUCKET_REGION")
ACCESS_KEY = os.getenv("ACCESS_KEY")
SECRET_ACCESS_KEY = os.getenv("SECRET_ACCESS_KEY")

# 建立Amazon S3客戶端
s3 = boto3.client(
    "s3",
    region_name=BUCKET_REGION,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_ACCESS_KEY
)

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/introduction")
def introduction():
	return render_template("introduction.html")    

@app.route("/login")
def main():
	return render_template("login.html")    

@app.route("/play")
def play():
	return render_template("play.html")  

@app.route("/videolist")
def videolist():
	return render_template("videolist.html") 

@app.route("/subscriberlist")
def subscriberlist():
	return render_template("subscriberlist.html") 

@app.route("/member")
def member():
	return render_template("member.html")     

@app.route("/play/channel/<channel_id>")
def playtochannel(channel_id):
	return render_template("channel.html")  

@app.route("/play/playlist/<playlist_id>")
def playtoplaylist(playlist_id):
	return render_template("playlist.html")  

@app.route("/play/video/<video_id>")
def playtovideo(video_id):
	return render_template("play.html")  

@app.route("/api/user", methods=["POST"])
def signup():

    #註冊一個新一個新的會員
    post = request.get_json()
    userid = post["userid"]
    useremail = post["useremail"]
    password = post["password"]
    # print(name, email, password)


    if(userid =="" or useremail == "" or password == ""): #驗證失敗
        return (jsonify({
                "error": True,
                "message": "註冊失敗，請輸入ID名稱、電子郵件與密碼"
                })),400

    if ("@" not in useremail or useremail.index("@") == len(useremail)-1):
        return (jsonify({
                "error": True,
                "message": "註冊失敗，電子郵件格式錯誤"
                })),400            

    sql = "SELECT useremail FROM member_list WHERE useremail=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useremail,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
        return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")       
    if (x != ""):#註冊失敗
        return (jsonify({
                "error": True,
                "message": "註冊失敗，重複的 Email"
                })),400
    else:#註冊成功

        sql = "INSERT INTO member_list (userid, useremail, password) VALUES (%s, %s, %s)" #SQL指令 新增資料
        val = (userid, useremail, password)
        try:
            # Get connection object from a pool
            connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
            cursor = connection_object.cursor()
            print("MySQL connection is opened")
            cursor.execute(sql, val)
            connection_object.commit()
        except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
        finally:
            # closing database connection.    
            cursor.close()
            connection_object.close()
            print("MySQL connection is closed")            
            print("新帳號註冊")
            return (jsonify({
                    "ok": True
                    })),200

@app.route("/api/user/auth", methods=["GET"])
def signinget():

    get_token = request.cookies.get("token")
    decoded_token = jwt.decode(get_token, "secret", algorithms=['HS256'])
    print(decoded_token)

    id = decoded_token["id"]
    userid = decoded_token["userid"]
    useremail = decoded_token["useremail"]
    print(id, userid, useremail)

    sql = "SELECT * FROM member_list WHERE id=%s and userid=%s and useremail=%s" #SQL指令 是否有對應的帳號、密碼
    val = (id, userid, useremail)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val) 
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "login": None,
                "message": "未登入，伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed") 
    if (x == ""):#驗證失敗
        return (jsonify({
                "data": None,
                })),200
    else: #驗證成功
        print("帳號登入")
        id=x[0] #使用者編號
        userid=x[1] #ID名稱
        useremail=x[2] #電子郵件
        photo=x[5] #大頭照
        return (jsonify({
                    "data": {
                    "id": id,
                    "userid": userid,
                    "useremail": useremail,
                    "photo": photo
                    }
                    }))    

@app.route("/api/user/auth", methods=["PUT"])
def signinput():

    put = request.get_json()
    useremail = put["useremail"]
    password = put["password"]

    if(useremail == "" or password == ""): #驗證失敗
        return (jsonify({
                "error": True,
                "message": "登入失敗，請輸入電子郵件與密碼"
                })),400

    sql = "SELECT * FROM member_list WHERE useremail=%s and password=%s" #SQL指令 是否有對應的帳號、密碼
    val = (useremail, password)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val) 
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")           
    if (x == ""):#驗證失敗
        return (jsonify({
                "error": True,
                "message": "登入失敗，帳號或密碼錯誤"
                })),400
    else: #驗證成功 
        print("帳號登入")
        id=x[0] #使用者編號
        userid=x[1] #ID名稱
        useremail=x[2] #電子郵件
        password=x[3] #密碼
        print(id, userid, useremail, password)

        #JWT
        key = "secret"
        encoded = jwt.encode({"id": id, "userid": userid, "useremail": useremail}, key, algorithm="HS256")
        print(encoded)

        response=make_response({"ok": True}, 200)
        response.set_cookie(key='token', value=encoded, expires=time.time()+60*60*24*7)
        # print(time())

        decoded = jwt.decode(encoded, "secret", algorithms=["HS256"])  
        print(decoded)

        return response
  
@app.route("/api/user/auth", methods=["DELETE"])
def signout():

    delete = request.get_json()
    id = delete["id"]
    userid = delete["userid"]
    useremail = delete["useremail"]

    sql = "SELECT * FROM member_list WHERE id=%s and userid=%s and useremail=%s" #SQL指令 是否有對應的帳號、密碼
    val = (id, userid, useremail)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val) 
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")           
    if (x == ""):#驗證失敗
        return (jsonify({
                "error": True,
                "message":"驗證錯誤"
                })),400
    else: #驗證成功 

        print("帳號登出")
        id=x[0] #使用者編號
        userid=x[1] #ID名稱
        useremail=x[2] #電子郵件

        response=make_response({"ok": True}, 200)
        response.set_cookie(key='token', value='') #delete
        


        return response


@app.route("/api/search", methods=["POST"])
def api_search_post():


    #新增一個主題分類
    post = request.get_json()
    userid = post["userid"]
    print(userid)
    keyword = post["keyword"]
    print(keyword)

    if(keyword ==""): #資料驗證失敗
        return (jsonify({
                "error": True,
                "message": "資料驗證失敗，請輸入新的主題關鍵字"
                })),400

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")



    sql = "SELECT * FROM topic_list WHERE userid=%s and topic=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber, keyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")       
    if (x != ""):#資料驗證成功
        return (jsonify({
                "ok": True,
                "message": "資料驗證成功，但為已存在的主題關鍵字"
                })),200
    else:#資料驗證成功

        sql = "INSERT INTO topic_list (userid, topic) VALUES (%s, %s)" #SQL指令 新增資料
        val = (useridnumber, keyword)
        try:
            # Get connection object from a pool
            connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
            cursor = connection_object.cursor()
            print("MySQL connection is opened")
            cursor.execute(sql, val)
            connection_object.commit()
        except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
        finally:
            # closing database connection.    
            cursor.close()
            connection_object.close()
            print("MySQL connection is closed")            
            print("新增主題關鍵字")
            return (jsonify({
                    "ok": True
                    })),200

@app.route("/api/search", methods=["GET"])
def api_search_get(): 

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)
    
    keyword = request.args.get("keyword","")
    # keyword="蘋果發表會"
    print("搜尋主題詞"+keyword)
      
    #search
    youtube_request = youtube.search().list(
        part="snippet",
        maxResults=21,
        q=keyword
    )
    youtube_response = youtube_request.execute()
    # print(response,"\n")
    # nums = (len(youtube_response)-1) 
    # print(nums)
    results = []
    # nextPageToken = youtube_response["nextPageToken"] #CDIQAA
    # prevPageToken = youtube_response["prevPageToken"] #CDIQAQ
    # print(youtube_response["items"])
    # print(results['id'].get('videoId'))
    for i in range(0,20):
        # print("------")
        title=youtube_response["items"][i]["snippet"]["title"]
        coverurl=youtube_response["items"][i]["snippet"]["thumbnails"]["high"]["url"]
        channelTitle=youtube_response["items"][i]["snippet"]["channelTitle"]
        thisitem=youtube_response["items"][i]["id"]
            
        
        # print(title)
        # print(coverurl)
        # print(channelTitle)
        print(thisitem)
        # print("------")
        result = {
                "thisId" : i,
                "title":title,
                "coverurl":coverurl,
                "channelTitle": channelTitle,
                "itemId":thisitem
                    }
        results.append(result)

    # print(nextPageToken)
    # print(prevPageToken)
    return jsonify({
            "data": results
            }     ), 200  

# @app.route("/api/playlist", methods=["GET"])
# def api_playlist_get(): 

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)

    playlistId = request.args.get("playlistId","")
    # keyword="蘋果發表會"
    print("搜尋播放清單"+playlistId)
      
    #search
    youtube_request = youtube.playlistItems().list(
        part="snippet, contentDetails", 
        playlistId=playlistId, 
        maxResults=1, 
    )
    youtube_response = youtube_request.execute()
    results = []
    for i in range(0,1):
        
        playlist_item = youtube_response["items"][i]
        title = playlist_item["snippet"]["title"]
        video_id = playlist_item["contentDetails"]["videoId"]
        thumbnail_url = playlist_item["snippet"]["thumbnails"]["default"]["url"]
        channel_title = playlist_item["snippet"]["channelTitle"]
        channel_id = playlist_item["snippet"]["channelId"]
        published_at = playlist_item["snippet"]["publishedAt"]
  
        result = {
                "title": title,
                "videoId": video_id,
                "thumbnailUrl": thumbnail_url,
                "channelTitle": channel_title,
                "channelId": channel_id,
                "publishedAt": published_at
                    }
        results.append(result)

    
    return jsonify({
            "data": results
            }     ), 200  

@app.route("/api/topic", methods=["GET"])
def api_topic(): 
    userid = request.args.get("userid","")
 
    print("使用者編號"+userid)

    print("HELLOOOOOOOOO")

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    results = []

    sql = "SELECT topic FROM topic_list WHERE userid=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
            print("Hi")
            result = {
                "topic" : x[0],
                    }
            results.append(result)
        print(results)        
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        return jsonify({
                "data": results
                }     ), 200      

@app.route("/api/topic", methods=["DELETE"])
def deletetopic():

    delete = request.get_json()
    id = delete["id"]
    # userid = delete["userid"]
    # useremail = delete["useremail"]
    # topicid = delete["topicid"]
    topicname = delete["topicname"]
    print(id,topicname)


    sql = "DELETE FROM topic_list WHERE userid=%s and topic=%s;" #SQL指令 是否有對應的帳號、密碼
    val = (id, topicname)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit() 
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")        
        print("主題關鍵字："+topicname+" 刪除")
        response=make_response({"ok": True}, 200)
        return response

@app.route("/api/videolist", methods=["GET"])
def api_videolist(): 
    userid = request.args.get("userid","")
 
    print("使用者編號"+userid)

    print("HELLOOOOOOOOO")

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    results = []

    sql = "SELECT category FROM category_list WHERE userid=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
            print("Hi Hello Hi 1")
            result = {
                "category" : x[0],
                    }
            results.append(result)
        print(results+"heyheyhey")        
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        return jsonify({
                "data": results
                }     ), 200      

@app.route("/api/videolist", methods=["DELETE"])
def deletevideolist():

    delete = request.get_json()
    id = delete["id"]
    # userid = delete["userid"]
    # useremail = delete["useremail"]
    # topicid = delete["topicid"]
    categoryname = delete["categoryname"]
    print(id,categoryname)

    sql = "SELECT * FROM category_list WHERE userid=%s and category=%s;" #SQL指令 檢查帳號 (userid)
    val = (id, categoryname)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        categorynumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")


    sql = "DELETE FROM video_list WHERE categoryid=%s;" #SQL指令 是否有對應的帳號、密碼
    val = (categorynumber,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit() 
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")        
        print("影片清單內容："+categoryname+" 刪除")


    sql = "DELETE FROM category_list WHERE id=%s;" #SQL指令 是否有對應的帳號、密碼
    val = (categorynumber,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit() 
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")        
        print("影片清單關鍵字："+categoryname+" 刪除")
        response=make_response({"ok": True}, 200)
        return response    

@app.route("/api/subscriberlist", methods=["GET"])
def api_subscriberlist(): 
    userid = request.args.get("userid","")
 
    print("使用者編號"+userid)

    print("HELLOOOOOOOOO")

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    results = []

    sql = "SELECT subscriber, subscribertitle FROM subscriber_list WHERE userid=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
            print("Hi Hello Hi 2")
            result = {
                "subscriber" : x[0],
                "subscribertitle" : x[1],
                    }
            results.append(result)
        print(results+"yoyoyo")        
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        return jsonify({
                "data": results
                }     ), 200      

@app.route("/api/subscriberlist", methods=["DELETE"])
def deletesubscriberlist():

    delete = request.get_json()
    id = delete["id"]
    # userid = delete["userid"]
    # useremail = delete["useremail"]
    # topicid = delete["topicid"]
    subscribername = delete["subscribername"]
    print(id,subscribername)


    sql = "DELETE FROM subscriber_list WHERE userid=%s and subscriber=%s;" #SQL指令 是否有對應的帳號、密碼
    val = (id, subscribername)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit() 
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")        
        print("影片清單關鍵字："+subscribername+" 刪除")
        response=make_response({"ok": True}, 200)
        return response

@app.route("/api/channel", methods=["GET"])
def api_channel_get(): 

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)

    channelId = request.args.get("channel","")
    # keyword="阿滴英文"
    print("搜尋頻道播放清單"+channelId)
      
    #search
    youtube_request = youtube.channels().list(
        part="snippet,statistics",
        id=channelId,
        maxResults=1,
        )

    youtube_response = youtube_request.execute()
    results = []
    x="customUrl"
    for i in range(0,1):
        
        channel_item = youtube_response["items"][i]
        channel_title = channel_item["snippet"]["title"]
        description = channel_item["snippet"]["description"]
        if x in channel_item["snippet"]:
            customUrl = channel_item["snippet"]["customUrl"]
        else:
            customUrl = ""
        published_at = channel_item["snippet"]["publishedAt"]
        thumbnail_url = channel_item["snippet"]["thumbnails"]["high"]["url"]
        subscribercount = channel_item["statistics"]["subscriberCount"]
        viewcount =  channel_item["statistics"]["viewCount"]
        videocount = channel_item["statistics"]["videoCount"]
        
  
        result = {
                
                 "channelTitle": channel_title,
                 "description": description,
                "thumbnailUrl": thumbnail_url,
                "customUrl": customUrl,
                "publishedAt": published_at,
                "subscriberCount": subscribercount,
                "viewCount": viewcount,
                "videoCount": videocount
                
                    }
        results.append(result)

        print(results)

    return jsonify({
            "data": results
            }     ), 200  


@app.route("/api/channelvideo", methods=["GET"])
def api_channelvideo_get(): 

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)
    
    
    channelTitle = request.args.get("channelTitle","")
    thisitemId = request.args.get("thisitemId","")

    # keyword="蘋果發表會"
    print("搜尋頻道影片:"+channelTitle)
      
    #search
    youtube_request = youtube.search().list(
        part="snippet",
        maxResults=4,
        order="date",
        channelId=thisitemId,
        type="video,playlist"
    )
    youtube_response = youtube_request.execute()
    # print(response,"\n")
    # nums = (len(youtube_response)-1) 
    # print(nums)
    results = []
    # nextPageToken = youtube_response["nextPageToken"] #CDIQAA
    # prevPageToken = youtube_response["prevPageToken"] #CDIQAQ
    # print(youtube_response["items"])
    # print(results['id'].get('videoId'))
    for i in range(0,4):
        # print("------")
        title=youtube_response["items"][i]["snippet"]["title"]
        coverurl=youtube_response["items"][i]["snippet"]["thumbnails"]["high"]["url"]
        channelTitle=youtube_response["items"][i]["snippet"]["channelTitle"]
        itemId=youtube_response["items"][i]["id"]
            
        
        # print(title)
        # print(coverurl)
        # print(channelTitle)
        print(itemId)
        # print("------")
        result = {
                "thisId" : i,
                "title":title,
                "coverurl":coverurl,
                "channelTitle": channelTitle,
                "itemId":itemId
                    }
        results.append(result)
        

    # print(nextPageToken)
    # print(prevPageToken)
    return jsonify({
            "data": results
            }     ), 200  


@app.route("/api/categoryvideo", methods=["POST"])
def api_category_post():

    #新增一個主題分類
    post = request.get_json()
    userid = post["userid"]
    print(userid)
    keyword = post["keyword"]
    print("增加類別清單"+keyword)

    if(keyword ==""): #資料驗證失敗
        return (jsonify({
                "error": True,
                "message": "資料驗證失敗，請輸入新的影片清單類別關鍵字"
                })),400

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")



    sql = "SELECT * FROM category_list WHERE userid=%s and category=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber, keyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")       
    if (x != ""):#資料驗證成功
        return (jsonify({
                "ok": True,
                "message": "資料驗證成功，但為已存在的主題關鍵字"
                })),200
    else:#資料驗證成功

        sql = "INSERT INTO category_list (userid, category) VALUES (%s, %s)" #SQL指令 新增資料
        val = (useridnumber, keyword)
        try:
            # Get connection object from a pool
            connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
            cursor = connection_object.cursor()
            print("MySQL connection is opened")
            cursor.execute(sql, val)
            connection_object.commit()
        except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
        finally:
            # closing database connection.    
            cursor.close()
            connection_object.close()
            print("MySQL connection is closed")            
            print("新增影片清單分類")
            return (jsonify({
                    "ok": True
                    })),200


@app.route("/api/categoryvideo", methods=["GET"])
def api_category_get(): 
    
    userid = request.args.get("userid","")
    keyword = request.args.get("keyword","")
    # keyword="蘋果發表會"
    print(userid)
    print("查詢清單類別"+keyword)

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")


    sql = "SELECT id FROM category_list WHERE userid=%s and category=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber, keyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        categoryidnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    results = []

    sql = "SELECT * FROM video_list WHERE categoryid=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (categoryidnumber, )

   
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
            print("Hi Hello Hi 3")
            result = {
                "videolistItemId" : x[0],
                "videoId" : x[2],
                "title" : x[3],
                "coverurl" : x[4],
                "channelTitle" : x[5],
                    }
            results.append(result)
        print(results+"heyheyhey")        
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        return jsonify({
                "data": results
                }     ), 200                    

@app.route("/api/categoryvideo", methods=["DELETE"])
def deletecategoryvideo():

    delete = request.get_json()
    userid = delete["id"]
    # userid = delete["userid"]
    # useremail = delete["useremail"]
    # topicid = delete["topicid"]
    videolistItemId = delete["videolistItemId"]
    videolistchannelTitle = delete["videolistchannelTitle"]
    print(userid,videolistItemId,videolistchannelTitle)
    


    sql = "DELETE FROM video_list WHERE id=%s and channeltitle=%s;" #SQL指令 是否有對應的帳號、密碼
    val = (videolistItemId, videolistchannelTitle)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit() 
    except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")        
        print("播放清單影片："+videolistItemId+" 刪除")
        response=make_response({"ok": True}, 200)
        return response


@app.route("/api/addvideo", methods=["POST"])
def api_addvideo_post():

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)

 #新增一個主題分類的影片
    post = request.get_json()
    userid = post["userid"]
    print(userid)
    categorykeyword = post["categorykeyword"]
    print(categorykeyword)
    youtubevideoidkeyword = post["keyword"]
    print(youtubevideoidkeyword)
    print("HAHAHIHI")

    if(youtubevideoidkeyword ==""): #資料驗證失敗
        return (jsonify({
                "error": True,
                "message": "資料驗證失敗"
                })),400

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")



    sql = "SELECT * FROM category_list WHERE userid=%s and category=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber, categorykeyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print(x[0])
        categorynumber = x[0]     
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed") 

    youtube_request = youtube.videos().list(
        part="snippet",
        maxResults=1,
        id=youtubevideoidkeyword
    )

    youtube_response = youtube_request.execute()
    # print(response,"\n")
    # nums = (len(youtube_response)-1) 
    # print(nums)
    # results = []
    # nextPageToken = youtube_response["nextPageToken"] #CDIQAA
    # prevPageToken = youtube_response["prevPageToken"] #CDIQAQ
    # print(youtube_response["items"])
    # print(results['id'].get('videoId'))
    for i in range(0,1):
        # print("------")
        title=youtube_response["items"][i]["snippet"]["title"]
        coverurl=youtube_response["items"][i]["snippet"]["thumbnails"]["high"]["url"]
        channelTitle=youtube_response["items"][i]["snippet"]["channelTitle"]
        

 

    sql = "INSERT INTO video_list (categoryid, videoid, title, coverurl, channeltitle) VALUES (%s, %s, %s, %s, %s)" #SQL指令 新增資料
    val = (categorynumber, youtubevideoidkeyword, title, coverurl, channelTitle)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit()
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
        return (jsonify({
            "error": True,
            "message": "伺服器內部錯誤"
            })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")            
        print("新增影片")
        return (jsonify({
                "ok": True
                })),200

@app.route("/api/subscribervideo", methods=["POST"])
def api_subscriber_post():

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)

    #新增一個主題分類
    post = request.get_json()
    userid = post["userid"]
    print(userid)
    keyword = post["keyword"]
    print("新增訂閱者"+keyword)

    if(keyword ==""): #資料驗證失敗
        return (jsonify({
                "error": True,
                "message": "資料驗證失敗，請輸入新的訂閱者關鍵字"
                })),400

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    if keyword.startswith("@") == False:
        sql = "SELECT * FROM subscriber_list WHERE userid=%s and channelid=%s"
    else:
        sql = "SELECT * FROM subscriber_list WHERE userid=%s and subscriber=%s"

    val = (useridnumber, keyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")       
    if (x != ""):#資料驗證成功
        return (jsonify({
                "ok": True,
                "message": "資料驗證成功，但為已存在的訂閱者關鍵字"
                })),200
    else:#資料驗證成功


        if keyword.startswith("@") == True:

            customUrl = keyword

            keyword = keyword.split("@")[1]
            print(keyword)

            youtube_request = youtube.search().list(
            part="snippet",
            maxResults=1,
            q=keyword,
            type="channel"
            )

            youtube_response = youtube_request.execute()
            # print(response,"\n")
            # nums = (len(youtube_response)-1) 
            # print(nums)
            results = []
            # nextPageToken = youtube_response["nextPageToken"] #CDIQAA
            # prevPageToken = youtube_response["prevPageToken"] #CDIQAQ
            # print(youtube_response["items"])
            # print(results['id'].get('videoId'))
            # for i in range(0,1):
                # print("------")
            title=youtube_response["items"][0]["snippet"]["title"]
            # customUrl=youtube_response["items"][0]["snippet"]["customUrl"]
            channelId=youtube_response["items"][0]["id"]["channelId"]

        else:
            channelId = keyword

            #search
            youtube_request = youtube.channels().list(
                part="snippet",
                id=channelId,
                maxResults=1,
                )

            print(channelId)
            youtube_response = youtube_request.execute()
            results = []

            customUrl = youtube_response["items"][0]["snippet"]["customUrl"]
            title=youtube_response["items"][0]["snippet"]["title"]


            

        sql = "INSERT INTO subscriber_list (userid, subscriber, subscribertitle, channelid) VALUES (%s, %s, %s, %s)" #SQL指令 新增資料
        val = (useridnumber, customUrl, title, channelId)
        try:
            # Get connection object from a pool
            connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
            cursor = connection_object.cursor()
            print("MySQL connection is opened")
            cursor.execute(sql, val)
            connection_object.commit()
        except Error as e:
            print("Error while connecting to MySQL using Connection pool ", e)
            return (jsonify({
                "error": True,
                "message": "伺服器內部錯誤"
                })),500
        finally:
            # closing database connection.    
            cursor.close()
            connection_object.close()
            print("MySQL connection is closed")            
            print("新訂閱者關鍵字")
            return (jsonify({
                    "ok": True
                    })),200

@app.route("/api/subscribervideo", methods=["GET"])
def api_subscriber_get(): 

    random_choice = random.choice(options)
    print(random_choice)

    DEVELOPER_KEY = os.getenv(random_choice)
    youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)
    
    userid = request.args.get("userid","")
    keyword = request.args.get("keyword","")
    # keyword="蘋果發表會"
    print("搜尋訂閱者影片"+keyword)

    sql = "SELECT * FROM member_list WHERE userid=%s" #SQL指令 檢查帳號 (userid)
    val = (userid,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hi")
        print(x[0])
        useridnumber = x[0]           
    except Error as e:  
    # except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally: 
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")

    sql = "SELECT subscribertitle, channelid FROM subscriber_list WHERE userid=%s and subscriber=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useridnumber, keyword)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hello")
        print(x[0]+","+x[1])
        subscribertitle= x[0]
        channelId= x[1]       
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed")  
      
    #search
    youtube_request = youtube.search().list(
        part="snippet",
        maxResults=21,
        q=subscribertitle,
        channelId=channelId,
    )
    youtube_response = youtube_request.execute()
    # print(response,"\n")
    # nums = (len(youtube_response)-1) 
    # print(nums)
    results = []
    # nextPageToken = youtube_response["nextPageToken"] #CDIQAA
    # prevPageToken = youtube_response["prevPageToken"] #CDIQAQ
    # print(youtube_response["items"])
    # print(results['id'].get('videoId'))
    for i in range(0,20):
        # print("------")
        title=youtube_response["items"][i]["snippet"]["title"]
        coverurl=youtube_response["items"][i]["snippet"]["thumbnails"]["high"]["url"]
        channelTitle=youtube_response["items"][i]["snippet"]["channelTitle"]
        itemId=youtube_response["items"][i]["id"]
            
        
        # print(title)
        # print(coverurl)
        # print(channelTitle)
        print(itemId)
        # print("------")
        result = {
                "thisId" : i,
                "title":title,
                "coverurl":coverurl,
                "channelTitle": channelTitle,
                "itemId":itemId
                    }
        results.append(result)
        print(results)
        

    # print(nextPageToken)
    # print(prevPageToken)
    return jsonify({
            "data": results
            }     ), 200  

# 處理上傳大頭照檔案請求
@app.route("/api/upload", methods=["POST"])
def upload():
    userid = request.form.get("userid")
    userpassword = request.form.get("userpassword")
    useremail = request.form.get("useremail")
    file = request.files["image"]
    filename = f"{datetime.now().timestamp()}.png"
    s3.upload_fileobj(
        file,
        BUCKET_NAME,
        filename,
        ExtraArgs={
            "ContentType": file.content_type
        }
    )
    image_url = f"https://{BUCKET_NAME}.s3.{BUCKET_REGION}.amazonaws.com/{filename}"
    # save_chat_record(content, image_url)

    sql = "UPDATE member_list SET password=%s, photo=%s WHERE userid=%s and useremail=%s;" #SQL指令 新增資料
    val = (userpassword, filename, userid, useremail)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        connection_object.commit()
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
        return (jsonify({
            "error": True,
            "message": "伺服器內部錯誤"
            })),500
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
        print("MySQL connection is closed")            
        print("新大頭照檔案上傳")
        return (jsonify({
                "ok": True
                })),200
    

# 處理取得會員大頭照紀錄請求
@app.route("/api/upload", methods=["GET"])
def get_upload():

    useremail = request.args.get("useremail","")

    sql = "SELECT userid, photo FROM member_list WHERE useremail=%s" #SQL指令 檢查是否有重複的帳號 (email)
    val = (useremail,)
    try:
        # Get connection object from a pool
        connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
        cursor = connection_object.cursor()
        print("MySQL connection is opened")
        cursor.execute(sql, val)
        myresult = cursor.fetchall()
        x=""
        for x in myresult:
            print(x)
        print("Hello")
        print(x[0]+","+x[1])
        userid= x[0]
        photo= x[1]       
    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
    finally:
        # closing database connection.    
        cursor.close()
        connection_object.close()
    print("MySQL connection is closed") 
    results = []
    result = {
                "userid" : userid,
                "photo":photo
                    }
    results.append(result)

    # print(nextPageToken)
    # print(prevPageToken)
    return jsonify({
            "data": results
            }     ), 200 



app.run(port=3080, debug=True)
