# multitub

![image](https://user-images.githubusercontent.com/43780809/224301131-1ce77685-d96b-4218-a2b7-7de90d438f79.png)

![1678188126560](https://user-images.githubusercontent.com/43780809/224207515-5897326a-2e36-4d1a-8be2-02a4422bba67.jpg)

- Framework: Python Flask
- AWS RDS: Normalize MySQL database in 3NF, using index to improve query efficiency.
- MySQL database: store users' basic info and history data of topics, video lists and subscribers.
- AWS S3: storage of uploaded images from users.
- AWS CloudFront: as CDN & S3 Cache.
- RESTful API: Interface between Front End and Back-End.
- Google Cloud (Google Develops): create a Google Cloud Console project, and a new set of API credentials to get an API key.
- Youtube data API v3: access YouTube's video, playlist, and channel data and integrate YouTube into existing functions.
- JWT: save users' status after login.
- Nginx: establish as Reverse Proxy.
- Docker-Compose: build image & deploy web server on EC2.
- Swagger: create an API Doc.
