from dotenv import load_dotenv
import os
from mysql.connector import Error
from mysql.connector import pooling


load_dotenv()

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

useremail = "may"

connection_object = connection_pool.get_connection() #連線物件 commit時 需要使用
cursor = connection_object.cursor()

sql = "INSERT INTO member_list (id, userid, useremail, password) VALUES ('4','Tina','tina','tina')" 


cursor.execute(sql,)
connection_object.commit()

rows = cursor.fetchall()


for row in rows:
    print(row)

cursor.close()
connection_object.close()
print("DONE!")
 
  