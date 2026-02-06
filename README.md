# Bullet Note

Since this project was solely intended for full-stack learning purposes, I did not incorporate project management features such as issues, issue boards, and milestones during development.

### Website link

<font color="blue">[BulletNote](https://clicklhere.online)</font>

### Completed function

1. Basic operation for notes (e.g. create, delete, update)
2. Authentication (e.g. login, register, logout)
3. Add dynamic param (useless for this project)
4. Search function --- 28.1.2026
5. Simple aspect function(To avoid try ... catch all the time) --- 29.1.2026
6. Add api document: http://localhost:5000/api-docs/ --- 4.2.2026

### Todo List

1. Search function (completed)
2. Dashboard
3. File upload & export
4. time setting/Deadline
5. Beautify the appearance 
6. ...

### Prerequisites

JS, MySQL

### Technology

Separation of front and back ends

Frontend: html5, js, react, vite

Backend: JS, express, RESTful API

**Project Initialization**

1. **Database create**

   `CREATE DATABASE bullet_note;`

2. **Backend**

   `cd backend`

   Create .env file and fill it.

   `copy .env.example .env` 

   Create test account
   
   `$env:NODE_ENV="development" npx sequelize-cli db:seed:all` 
   
   ```
   username: admin	password: admin	email: admin@gmail.com
   username: root	password: root	email: root@gmail.com
   ```
   
   Activate 
   
   `npm run dev`
   
3. **Frontend**

   `cd frontend`

   Install dependency

   `npm install`

   Activate

   `npm run dev`

   



