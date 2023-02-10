import requests
import pprint
import argparse
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import os
load_dotenv()

DEVELOPER_KEY = os.getenv("YOUTUBE_KEY_DEVELOPER_KEY")
youtube = build('youtube', 'v3', developerKey=DEVELOPER_KEY)



base_url = "https://www.googleapis.com/youtube/v3/"
api_function = "videos"                               
query = {
    "key":DEVELOPER_KEY,   
    "chart":"mostPopular",         
    "maxResults":50,
    "regionCode":"TW",
    "part": "snippet,contentDetails,statistics",

}

response = requests.get(base_url + api_function, params=query)

if response.status_code == 200:
    response_dict = response.json() 
    results1 =  {
        i+1: response_dict["items"][i]["snippet"]["channelTitle"]
        for i in range(0,50)
        } 
    results2 =  {
        i+1: response_dict["items"][i]["statistics"]["viewCount"]
        for i in range(0,50)
        } 
    results3 =  {
        i+1: response_dict["items"][i]["snippet"]["channelId"]
        for i in range(0,50)
        } 
   
# pagination
    if "nextPageToken" in response_dict.keys(): #下一頁
      query['pageToken'] = response_dict["nextPageToken"]
      response = requests.get(base_url + api_function, params = query)
 
      if response.status_code == 200:
        response_dict = response.json()
        for i in range(0,50):
            results1.update( {i+51: response_dict["items"][i]["snippet"]["channelTitle"] } )
      if response.status_code == 200:
        response_dict = response.json()
        for i in range(0,50):
            results2.update( {i+51: response_dict["items"][i]["statistics"]["viewCount"] } )     
      if response.status_code == 200:
        response_dict = response.json()
        for i in range(0,50):
            results3.update( {i+51: response_dict["items"][i]["snippet"]["channelId"] } )    

pprint.pprint(results1)
pprint.pprint(results2)
pprint.pprint(results3)



import requests
import pprint

base_url = "https://www.googleapis.com/youtube/v3/"
api_function = "channels"                               
query = {
    "key":DEVELOPER_KEY,   
    "part": "snippet,statistics",
    "id": "UCwWXGnvVmi-6Sfx2wf8S8tQ",
    
}

response = requests.get(base_url + api_function, params=query)

if response.status_code == 200:
     response_dict = response.json()
     results3_list = [ response_dict["items"][0]["statistics"]["subscriberCount"] ]
print(results3_list)


#影片資訊
import requests
import pprint

base_url = "https://www.googleapis.com/youtube/v3/"
api_function = "videos"                               
query = {
    "key":DEVELOPER_KEY,   
    "part": "snippet",
    "id": "jeqH4eMGjhY",
    
}

response = requests.get(base_url + api_function, params=query)


if response.status_code == 200:
     response_dict = response.json()
     results3_list = [ response_dict["items"][0]["snippet"]["title"]]
print(results3_list)

#search
request = youtube.search().list(
    part="snippet",   
    q="蘋果發表會"
)
response = request.execute()
# print(response,"\n")
nums = (len(response)-1) 
print(nums)
for i in range(0,nums):
    print("------")
    a=response["items"][i]["id"]["videoId"]
    b=response["items"][i]["snippet"]["title"]
    c=response["items"][i]["snippet"]["thumbnails"]["high"]["url"]
    d=response["items"][i]["snippet"]["channelTitle"]
    print(a)
    print(b)
    print(c)
    print(d)
    print("------")

 