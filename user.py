from flask import Blueprint
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
import mysql
import json
import requests
import jwt
import time
import datetime
from dotenv import load_dotenv
import os

load_dotenv()

user_bp = Blueprint('user',__name__)

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

@user_bp.route("/api/user", methods=["POST"])
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

@user_bp.route("/api/user/auth", methods=["GET"])
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

@user_bp.route("/api/user/auth", methods=["PUT"])
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
  
@user_bp.route("/api/user/auth", methods=["DELETE"])
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