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


load_dotenv()


DEVELOPER_KEY = os.getenv("YOUTUBE_KEY_DEVELOPER_KEY")
youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)

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

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/login")
def main():
	return render_template("login.html")    

@app.route("/play")
def play():
	return render_template("play.html")  

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
        return (jsonify({
                    "data": {
                    "id": id,
                    "userid": userid,
                    "useremail": useremail
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

@app.route("/api/channel", methods=["GET"])
def api_channel_get(): 
    channelId = request.args.get("channel","")
    # keyword="蘋果發表會"
    print("搜尋播放清單"+channelId)
      
    #search
    youtube_request = youtube.channels().list(
        part="snippet,statistics",
        id=channelId,
        maxResults=1,
        )

    youtube_response = youtube_request.execute()
    results = []
    for i in range(0,1):
        
        channel_item = youtube_response["items"][i]
        channel_title = channel_item["snippet"]["title"]
        description = channel_item["snippet"]["description"]
        customUrl = channel_item["snippet"]["customUrl"]
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

    
    return jsonify({
            "data": results
            }     ), 200  


app.run(port=3080, debug=True)
