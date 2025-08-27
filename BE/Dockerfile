# BE/Dockerfile
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 시스템 deps (필요 시 추가)
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스
COPY . .

# uvicorn 실행 (포트 8000)
EXPOSE 8000
CMD ["python","-m","uvicorn","BE.src.main:app","--host","0.0.0.0","--port","8000"]
