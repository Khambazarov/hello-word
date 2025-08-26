# Realtime-Chat: MERN-Stack APP.

This project is a real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js).

###### Estimated read time: 3 minutes

---

### TOOLS

- VSCODE: https://code.visualstudio.com
- **Team members: synchronize ALL extensions**
- GITHUB: https://github.com
- GOOGLE-MEET: https://meet.google.com
- TRELLO: https://trello.com
- SLACK: https://slack.com

---

### USED TECHNOLOGIES

##### FRONTEND

- VITE - react.js: https://vite.dev/guide

***Used Notification Sounds & Icon***
-   https://mixkit.co/free-sound-effects/robot/
-   https://pixabay.com/de/sound-effects/search/finger%20snap/
-   https://www.flaticon.com/free-icon/robot_2593635?term=robot&page=1&position=35&origin=search&related_id=2593635

***Used Emojis***
-   https://github.com/ealush/emoji-picker-react

```bash
npm create vite@latest
```

```bash
npm i zustand socket.io-client
```

- TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview
- socket.io-client: https://socket.io/docs/v4/client-installation/

##### CSS - STYLES

- tailwind: https://tailwindcss.com/docs/installation/using-vite
- daisyUI: https://daisyui.com
- react-toastUI: https://react-hot-toast.com

##### BACKEND - node.js:

```bash
npm i express cors dotenv mongoose bcrypt jsonwebtoken cookie-parser cloudinary socket.io && npm i -D nodemon
```

- express: https://expressjs.com
- cors: https://www.npmjs.com/package/cors
- dotenv: https://www.npmjs.com/package/dotenv
- mongoose: https://mongoosejs.com
- bcrypt: https://www.npmjs.com/package/bcrypt
- jwt: https://www.npmjs.com/package/jsonwebtoken
- cookie-parser: https://www.npmjs.com/package/cookie-parser
- cloudinary: https://cloudinary.com
- socket.io: https://socket.io
- nodemon: https://www.npmjs.com/package/nodemon

##### DATABASE - mongoDB: https://cloud.mongodb.com

---

### Installation

##### Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

---

### Directory Structure

```plaintext
backend/
    node_modules/...
    .env
    .env.sample
    .gitignore
    .http
    .http.sample
    middlewares/
        authMiddleware.js
    models/
        userModel.js
        messageModel.js
    routes/
        userRouter.js
        messageRouter.js
    schemas/
        userSchema.js
        messageSchema.js
    services/
        userService.js
    utils/
        logger.js
    package-lock.json
    package.json
    server.js

frontend/
    node_modules/...
    public/
        favicon.ico
    src/
        assets/
            avatar.png
        components/
            Chat/
                ChatBox.jsx
                ChatInput.jsx
            Auth/
                Login.jsx
                Register.jsx
        contexts/
            AuthContext.jsx
        hooks/
            useAuth.js
            useChat.js
        pages/
            Home.jsx
            ChatRoom.jsx
        services/
            api.js
        App.css
        App.jsx
        index.css
        main.jsx
    .env
    .env.sample
    .gitignore
    eslint.config.js
    index.html
    package-lock.json
    package.json
    vite.config.js
README.md
```

---

### Environment Variables

Create a `.env` file in both the **backend** and **frontend** directories based on the `.env.sample` files and add the necessary environment variables.

---
