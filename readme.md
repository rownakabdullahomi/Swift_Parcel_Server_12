# SwiftParcel - Server Side 🚀

---

### 🔗 Deployment Links:
 🎨 - **Frontend**: [https://swift-parcel-4a623.web.app](https://swift-parcel-4a623.web.app)

 ⚙️ - **Backend**: [https://swift-parcel-server-five.vercel.app](https://swift-parcel-server-five.vercel.app)

---

## ✨ Short description
Welcome to the backend server of **SwiftParcel**, a comprehensive Parcel Management System built with the **MERN stack**. This server powers the application's core functionalities, including user authentication, parcel management, payments, and more.

---

## 🌟 Features

- 🔐 **JWT Authentication**: Secure user and admin authentication.
- 💳 **Stripe Integration**: Seamless payment processing with Stripe.
- 📦 **Parcel Management**: CRUD operations for parcels.
- 📊 **Real-time Dashboard**: Efficient data tracking and analytics for admin users.
- 🌐 **RESTful API**: Structured endpoints for all major functionalities.
- 🛡️ **Secure Operations**: Password hashing and sensitive data protection.
- 🌍 **Deployed on Vercel**: Fast and reliable hosting.
- 📁 **MongoDB**: Scalable and efficient database for parcel data.
- 🔄 **Error Handling**: Global error handling with appropriate HTTP responses.
- 🛠️ **Middleware**: Smart use of custom middlewares for request validation and role-based access control.

---

## 🔑 Admin Login Credentials

Use the following credentials for testing the admin panel:

- **Email**: `admin@admin.com`  
- **Password**: `123456aA@`

---

## 🛠️ Technologies Used

- **Backend Framework**: Node.js with Express.js 🟩
- **Database**: MongoDB 🍃
- **Authentication**: JWT & Firebase 🔐
- **Payments**: Stripe 💳
- **Deployment**: Vercel 🌍
- **Language**: JavaScript (ES6+) 🟨

---

## 🚏 API Endpoints

### Authentication

- **Generate JWT Token**
  - `POST /jwt`
  - **Request Body:** `{ email: string, password: string }`
  - **Response:** `{ token: string }`

---

### Users

- **Get All Users**
  - `GET /all/users`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Admin only

- **Get All Users Except Current User**
  - `GET /all/users/:email`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Admin only

- **Add a New User**
  - `POST /users`
  - **Request Body:** `{ email, name, userType }`
  - **Response:** `{ message: string, insertedId: string | null }`

- **Get User Role by Email**
  - `GET /user/role/:email`
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** `{ email, userType }`

- **Update User Role**
  - `PATCH /user/update/role/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ userType: string }`
  - **Access:** Admin only

- **Update User Profile**
  - `PATCH /user/update/profile/:email`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ name, photoURL }`
  - **Response:** `{ matchedCount, modifiedCount }`

- **Cancel Parcel by User**
  - `PATCH /user/cancel/parcel/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ status: string }`
  - **Response:** `{ matchedCount, modifiedCount }`

- **Submit Review**
  - `PUT /user/submitReview/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ rating, feedback, reviewDate }`

---

### Admin

- **Get All Delivery Men**
  - `GET /all/deliveryMan`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Admin only

- **Get Statistics for Parcels and Users**
  - `GET /home/statistics`
  - **Response:** `{ totalUsers, totalParcelsBooked, totalParcelsDelivered }`

- **Get Top Delivery Men**
  - `GET /top-delivery-men`
  - **Response:** `[ { name, photoURL, parcelCount, averageRating } ]`

- **Search Parcels by Delivery Date**
  - `GET /parcels/search`
  - **Headers:** `Authorization: Bearer <token>`
  - **Query Parameters:** `?from=<date>&to=<date>`
  - **Response:** `[ { ...parcelDetails } ]`

---

### Parcels

- **Get All Parcels**
  - `GET /all/parcels`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Admin only

- **Get User-Specific Parcel**
  - `GET /user/parcel/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** `{ ...parcelDetails }`

- **Get All Parcels by User**
  - `GET /all/parcels/:email`
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** `[ { ...parcelDetails } ]`

- **Book a Parcel**
  - `POST /book/parcel`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ ...parcelDetails }`
  - **Response:** `{ insertedId: string }`

- **Update Parcel Status (Admin)**
  - `PUT /admin/update/parcel/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ selectedDeliveryManId, approximateDate }`
  - **Response:** `{ matchedCount, modifiedCount }`

- **Update Parcel Status (Delivery Man)**
  - `PUT /deliveryMan/update/parcel/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ status: string }`
  - **Response:** `{ matchedCount, modifiedCount }`

---

### Payments

- **Create Payment Intent**
  - `POST /create-payment-intent`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ price: number }`
  - **Response:** `{ clientSecret: string }`

- **Update Parcel Payment Status**
  - `PUT /user/updateParcelPayment/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ paymentId, paidAmount, paymentStatus }`
  - **Response:** `{ matchedCount, modifiedCount }`

---

### Reviews

- **Get Reviews of Delivery Man**
  - `GET /reviews/:deliveryManId`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Delivery Man only
  - **Response:** `[ { rating, feedback, reviewDate } ]`

---

### Delivery Requests

- **Get Delivery Requests for Delivery Man**
  - `GET /all/deliveryRequests/:id`
  - **Headers:** `Authorization: Bearer <token>`
  - **Access:** Delivery Man only
  - **Response:** `[ { ...parcelDetails } ]`

---

## 🌀 NPM Packages Used

- [express](https://www.npmjs.com/package/express): Web framework for building the server-side application.  
- [mongodb](https://www.npmjs.com/package/mongodb): MongoDB driver for seamless database integration.  
- [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from a `.env` file.  
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Implements token-based authentication.  
- [cors](https://www.npmjs.com/package/cors): Enables secure cross-origin resource sharing.  
- [morgan](https://www.npmjs.com/package/morgan): HTTP request logger middleware for debugging and monitoring.  
- [stripe](https://www.npmjs.com/package/stripe): Handles payment processing and integration with Stripe APIs.  

---

## 🙌 Acknowledgments

Special thanks to all the open-source libraries and tools used in this project! 💜

---

## 📧 Contact With Me for More

Feel free to explore and contribute to this repository. Happy coding!😊

## 🤝 Thank You