# Bullet Note

Since this project was solely intended for full-stack learning purposes, I did not incorporate project management features such as issues, issue boards, and milestones during development.

### Website link

<font color="blue">[BulletNote](https://clicklhere.online)</font>

> [!IMPORTANT]
>
> Due to technical and time constraints, this webpage is temporarily unable to function properly on mobile devices.

### Completed function

1. Basic operation for notes (e.g. create, delete, update)
2. Authentication (e.g. login, register, logout)
3. Add dynamic param (useless for this project)
4. Search function --- 28.1.2026
5. Simple aspect function(To avoid try ... catch all the time) --- 29.1.2026
6. Add api document: http://localhost:5000/api-docs/ --- 4.2.2026
7. Beautify the appearance (help from figma) --- 5.2.2026
8. Build website --- 6.2.2026
9. Fixed 10+ bugs (mostly caused in authentication) from completed item 7 and 8. --- 6.2.2026

### Todo List

1. **To ensure that web pages function correctly on mobile web devices** (related to bug 1, todo item 2)
2. Convert cookie authentication to token (store in localStorage) authentication
3. Dashboard
4. File upload & export
5. time setting/Deadline
6. ...

### Bug

1. Backend seems that can not take cookie from mobile browser.

### Prerequisites

JS, MySQL

### Technology

Separation of front and back ends

Frontend: html5, js, react, vite, TypeScript

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

   



