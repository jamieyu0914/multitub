# 使用 Python 基底映像                                                                                                                                                                                    
FROM python:3.12
# 設定工作目錄
WORKDIR /app
# 設定環境變數（可選）
# ENV PYTHONUNBUFFERED=1
# 複製 requirements 檔案
COPY requirements.txt ./
# 安裝依賴
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt --root-user-action=ignore
# 複製程式碼
COPY . .
# 對外開放的 port（例如 Flask 預設是 5000）
EXPOSE 3030
# 啟動程式（以 Flask 為例）
CMD ["python", "app.py"]
