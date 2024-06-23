# Build frontend
FROM node:14 AS frontend-build
WORKDIR /app/frontend
COPY 01-react-frontend/ .
RUN npm install && npm run build

# Build backend and combine with frontend
FROM python:3.9
WORKDIR /app
COPY 02-fastapi-backend/ .
COPY --from=frontend-build /app/frontend/build /app/build
COPY 02-fastapi-backend/requirements.txt .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
