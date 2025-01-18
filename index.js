require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000
const app = express()

app.use(cors());
app.use(express.json())
app.use(morgan('dev'))





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d3h8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db("swiftParcelDB").collection("users");
    const parcelCollection = client.db("swiftParcelDB").collection("parcels");


    // Payment
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const paidAmount = parseInt(price * 100); // Amount should be in cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount: paidAmount, // Amount in cents
        currency: "usd",
        payment_method_types: ["card"]
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });

    });


    app.put("/user/updateParcelPayment/:id", async (req, res) => {
      const parcelId = req.params.id;
      const { paymentId, paidAmount, paymentStatus } = req.body;
      const query = { _id: new ObjectId(parcelId) };
      const updatedDoc = {
        $set: {
          paymentId,
          paidAmount,
          paymentStatus,
        }
      }

      const result = await parcelCollection.updateOne(query, updatedDoc);
      res.send(result);

    });




    // user related apis

    // get all user
    app.get("/all/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    // get all user except current user and delivery man
    app.get("/all/users/:email", async (req, res) => {
      const email = req.params.email;

      // Query to exclude the current user and only include users with userType "User"
      const query = {
        $and: [
          { email: { $ne: email } }, // Exclude the current user
          { userType: "User" }, // Include only users with userType "User"
        ],
      };

      const result = await userCollection.find(query).toArray();
      res.send(result);
    });


    app.post("/users", async (req, res) => {
      const user = req.body;
      // check if the user already exists...
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne({ ...user, timestamp: Date.now() });
      res.send(result);
    })

    // get a specific user data
    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    // Get statistics data
    app.get("/parcels/statistics", async (req, res) => {
      const parcels = await parcelCollection.find({}).toArray();
      res.send(parcels);
    });

    // Update user role
    app.patch("/user/update/role/:id", async (req, res) => {
      const id = req.params.id;
      const { userType } = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { userType } };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // get a specific user data
    // app.get("/user/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await userCollection.findOne(query);
    //   res.send(result);
    // })


    app.get("/all/users-with-parcels/:email", async (req, res) => {
      const email = req.params.email;

      // Query to exclude the current user and only include userType "User"
      const usersQuery = {
        $and: [{ email: { $ne: email } }, { userType: "User" }],
      };

      // Get all users
      const users = await userCollection.find(usersQuery).toArray();

      // Aggregate parcels count and total spent amount for each user
      const parcelsAggregation = await parcelCollection
        .aggregate([
          {
            $group: {
              _id: "$email", // Group parcels by email
              parcelsBooked: { $sum: 1 }, // Count parcels for each user
              totalSpent: { $sum: "$price" }, // Total spent amount for each user's parcels
            },
          },
        ])
        .toArray();

      // Merge parcels count and total spent with users
      const usersWithParcels = users.map((user) => {
        const parcelData = parcelsAggregation.find(
          (parcel) => parcel._id === user.email // Match parcel.email with user.email
        );
        return {
          ...user,
          parcelsBooked: parcelData ? parcelData.parcelsBooked : 0,
          totalSpent: parcelData ? parcelData.totalSpent : 0,
        };
      });

      res.send(usersWithParcels);
    });





    // Update a specific user
    app.patch(
      '/user/update/profile/:email',
      async (req, res) => {
        const email = req.params.email;
        const { name, photoURL } = req.body;
        // Filter out null or undefined fields from the update
        const updateFields = {};
        if (name) updateFields.name = name;
        if (photoURL) updateFields.photoURL = photoURL;
        const query = { email }
        const updateDoc = { $set: updateFields };
        const result = await userCollection.updateOne(query, updateDoc);

        // If the name is updated, also update it in parcelCollection
        if (name) {
          const user = await userCollection.findOne(query);

          const parcelQuery = { email: user.email }; // Find parcels by user email
          const parcelUpdateDoc = { $set: { name: name } }; // Update name in parcels
          const parcelUpdateResult = await parcelCollection.updateMany(parcelQuery, parcelUpdateDoc);
          console.log(`${parcelUpdateResult.modifiedCount} parcels updated.`);

        }
        res.send(result)
      }
    )

    // get all delivery man
    app.get("/all/deliveryMan", async (req, res) => {
      const query = { userType: "DeliveryMan" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })

    // get add delivery request of a delivery man
    app.get("/all/deliveryRequests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { deliveryManId: id, status: "on the way" };
      const result = await parcelCollection.find(query).toArray();
      res.send(result);
    })

    // add review and feedback by user
    app.put("/user/submitReview/:id", async (req, res) => {
      const id = req.params.id;
      const { rating, feedback } = req.body;

      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          rating,
          feedback,
        },
      };

      const result = await parcelCollection.updateOne(query, update);
      res.send(result);

    });



    // parcel related apis

    // get all parcels
    app.get("/all/parcels", async (req, res) => {
      const result = await parcelCollection.find().toArray();
      res.send(result);
    })
    // get a parcel data based on id
    app.get("/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await parcelCollection.findOne(query);
      res.send(result);
    })

    // get all parcels of a specific user
    app.get("/all/parcels/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await parcelCollection.find(query).toArray();
      res.send(result);
    })


    app.post("/book/parcel", async (req, res) => {
      const parcel = req.body;
      const result = await parcelCollection.insertOne({ ...parcel, bookingDate: new Date() });
      res.send(result);
    })



    // Update a selected parcel status and add deliveryManId, approximateDate
    app.put(
      '/admin/update/parcel/:id',
      async (req, res) => {
        const id = req.params.id;
        const { selectedDeliveryManId, approximateDate } = req.body;
        const query = { _id: new ObjectId(id) }
        const updateDoc = {
          $set: {
            approximateDate,
            deliveryManId: selectedDeliveryManId,
            status: "on the way",
          },
        }
        const result = await parcelCollection.updateOne(query, updateDoc)
        res.send(result)
      }
    )


    // update a parcel status by a delivery man
    app.put("/deliveryMan/update/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status,
        }
      }
      const result = await parcelCollection.updateOne(query, updatedDoc);
      res.send(result);
    })

    // Update a specific parcel data by user
    app.patch(
      '/user/update/parcel/:id',
      async (req, res) => {
        const id = req.params.id;
        const { name,
          email,
          phone,
          parcelType,
          parcelWeight,
          receiverName,
          receiverPhone,
          deliveryAddress,
          requestedDeliveryDate,
          latitude,
          longitude,
          price, } = req.body;
        const query = { _id: new ObjectId(id) }
        const updateDoc = {
          $set: {
            name,
            email,
            phone,
            parcelType,
            parcelWeight,
            receiverName,
            receiverPhone,
            deliveryAddress,
            requestedDeliveryDate,
            latitude,
            longitude,
            price,
          },
        }
        const result = await parcelCollection.updateOne(query, updateDoc)
        res.send(result)
      }
    )

    // Cancel a specific parcel order by user
    app.patch("/user/cancel/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status
        },
      }
      const result = await parcelCollection.updateOne(query, updateDoc)
      res.send(result)
    })

















    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello from SwiftParcel Server..')
})

app.listen(port, () => {
  console.log(`SwiftParcel is running on port ${port}`)
})




// GitHub Repository Link
// https://github.com/Programming-Hero-Web-Course4/b10a12-server-side-rownakabdullahomi