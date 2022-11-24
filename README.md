# 🚀 Express-Social

A REST API for a social network web application.

## 📝 Description

✴️ **User Accounts Can Do The Following:**

- Create a new user account.
- Sign in.
- Update their profile.
- Update their password.
- Request a password reset URL if they forgot the password.
- View paginated home feed that includes all posts written by users they are following.
- View their profile and other users' profiles.
- Write, edit, delete posts and comments. Adding images is allowed in posts.
- Like, unlike posts and comments.
- View post and comments were written on it.
- Follow, unfollow other users.
- View their following and followers lists.
- Search users by their names.
- View the suggested list of other users they may follow.

❇️ **Moderator Accounts Can Do The Following:**

- Request all users.
- Moderators have all the privileges of users.

## 💎 Technologies

1. Nodejs / Express
2. MongoDB / Mongoose
3. Used `multer` for uploading images to the server.
4. Used `cloudinary` for hosting and managing images.
5. Used fake SMTP service "Ethereal" for sending welcome emails and password reset emails. `nodemailer` is used to connect with the mail service.
6. Packages used for web security: `helmet`, `express-mongo-sanitize`, `express-rate-limit`, `jsonwebtoken`, `bcryptjs`, `validator`, `hpp`.
7. Packages used for web performance: `cors`, `compression`.

## ⚙️ Installation

**Step 1:** Install dependencies.

```shell
npm install
```

**Step 2:** [Create MongoDB Atlas account](https://docs.atlas.mongodb.com/getting-started/).

**Step 3:** Create a `.env` file in the root folder and add the required environment variables. Check the `.env.sample` file to find all the required environment variables.

**Step 4:** If you need predefined datasets, import files from `/data/exportedData/` folder by using the [`mongoimport` tool](https://docs.mongodb.com/database-tools/mongoimport/), and upload folders from `/data/exportedImages/` to a cloudinary library with the same cloud name as the one used in image URLs.

```shell
mongoimport <connection-string> --collection <collection> --drop --file <file> --jsonArray
```

**Step 5:** Start the server.

```shell
# In a development environment.
npm run start-dev

# In a production environment.
npm run start-prod
```

## 🚥 API Design

### 1. Resources / Models

| #   | Resource | Model   |
| --- | -------- | ------- |
| 1   | Users    | User    |
| 2   | Posts    | Post    |
| 3   | Comments | Comment |
| 4   | Likes    | Like    |

### 2. Routes

#### 2.1. Public Routes

| #   | HTTP Method | URL                                       | Controller     |
| --- | ----------- | ----------------------------------------- | -------------- |
| 1   | `POST`      | `/api/v1/users/signup`                    | createOneUser  |
| 2   | `POST`      | `/api/v1/users/signin`                    | authenUser     |
| 3   | `POST`      | `/api/v1/users/forgotPassword`            | forgotPassword |
| 4   | `PATCH`     | `/api/v1/users/resetPassword/:resetToken` | resetPassword  |

#### 2.2. Private Routes

- **Notes:**

- `:userId` refers to:

  - If `/:postId` comes last: the author of the post.
  - If `/:commentId` comes last: the author of the comment.

- For `post`, `patch`, and `delete` requests:

  - `userId` has to be the logged in user.

##### 2.2.1. UserId has to be the logged in user

| #   | HTTP Method | URL                                                             | Controller        |
| --- | ----------- | --------------------------------------------------------------- | ----------------- |
| 1   | `PATCH`     | `/api/v1/users/:userId`                                         | updateOneUser     |
| 2   | `DELETE`    | `/api/v1/users/:userId`                                         | deleteOneUser     |
| 3   | `PATCH`     | `/api/v1/users/:userId/updatePassword`                          | updatePassword    |
| 4   | `PATCH`     | `/api/v1/users/:userId/follow/:followId`                        | followUser        |
| 5   | `GET`       | `/api/v1/users/:userId/explore`                                 | exploreUsers      |
| 6   | `POST`      | `/api/v1/users/:userId/posts`                                   | createOnePost     |
| 7   | `PATCH`     | `/api/v1/users/:userId/posts/:postId`                           | updateOnePost     |
| 8   | `DELETE`    | `/api/v1/users/:userId/posts/:postId`                           | deleteOnePost     |
| 9   | `GET`       | `/api/v1/users/:userId/posts/home?skip=num&limit=num`           | requestHomeFeed   |
| 10  | `POST`      | `/api/v1/users/:userId/posts/:postId/comments`                  | createOneComment  |
| 11  | `PATCH`     | `/api/v1/users/:userId/posts/:postId/comments/:commentId`       | updateOneComment  |
| 12  | `DELETE`    | `/api/v1/users/:userId/posts/:postId/comments/:commentId`       | deleteOneComment  |
| 13  | `POST`      | `/api/v1/users/:userId/posts/:postId/likes`                     | createPostLike    |
| 14  | `POST`      | `/api/v1/users/:userId/posts/:postId/comments/:commentId/likes` | createCommentLike |

##### 2.2.2. UserId could be any user

| #   | HTTP Method | URL                                                               | Controller           |
| --- | ----------- | ----------------------------------------------------------------- | -------------------- |
| 1   | `GET`       | `/api/v1/users/:userId`                                           | requestOneUser       |
| 2   | `GET`       | `/api/v1/users/:userId/following`                                 | requestUserFollowing |
| 3   | `GET`       | `/api/v1/users/:userId/followers`                                 | requestUserFollowers |
| 4   | `GET`       | `/api/v1/users/search?name=string`                                | searchUsersByName    |
| 5   | `GET`       | `/api/v1/users/:userId/posts?skip=num&limit=num`                  | requestAllPosts      |
| 6   | `GET`       | `/api/v1/users/:userId/posts/:postId`                             | requestOnePost       |
| 7   | `GET`       | `/api/v1/users/:userId/posts/:postId/comments?skip=num&limit=num` | requestAllComments   |

#### 2.3. Moderator Only Routes

| #   | HTTP Method | URL             | Controller      |
| --- | ----------- | --------------- | --------------- |
| 1   | `GET`       | `/api/v1/users` | requestAllUsers |

### 3. Controllers

#### 3.1. Data Response

- Req:
  - HTTP:
  - authorization header ?
  - parameters ?
  - query parameters ?
  - data ?
- Res:
  - results
  - status
  - message ?
  - data

#### 3.2. Error Response

##### 3.2.1. In Development

```js
{
  status: ...,
  message: error.message,
  error: { ...error, stack: error.stack }
}
```

##### 3.2.2. In Production

```js
{
  status: ...,
  message: error.message,
}
```
