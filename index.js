const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhxyp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload())

const port = 5000;

app.get('/', (req, res) => {
  res.send("Server is live");
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const bookingCollection = client.db("carRepairService").collection("bookingService");
  const serviceCollection = client.db("carRepairService").collection("services");
  const reviewCollection = client.db("carRepairService").collection("review");
  const adminCollection = client.db("carRepairService").collection("admin");
  const moderatorCollection = client.db("carRepairService").collection("moderator");
  app.post('/bookService', (req, res) => {
    const bookingService = req.body;
    // console.log(bookingService)
    bookingCollection.insertOne(bookingService)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/service-list', (req, res) => {
    bookingCollection.find()
      .toArray((err, serviceList) => {
        res.send(serviceList)
      })
  })
  app.get('/allServices', (req, res) => {
    serviceCollection.find()
      .toArray((err, allServices) => {
        res.send(allServices)
      })
  })

  app.post('/addNewService', async (req, res) => {
    const serviceName = req.body.serviceName;
    const pic = req.files.file;
    console.log(serviceName)
    const picData = pic.data;
    const encodedPic = picData.toString('base64');
    const imageBuffer = Buffer.from(encodedPic, 'base64');
    const service = {
      serviceName,
      image: imageBuffer
    }
    const result = await serviceCollection.insertOne(service);
    res.json(result);
  })

  app.post('/addReview', async (req, res) => {
    const name = req.body.name;
    const companyName = req.body.companyName;
    const designation = req.body.designation;
    const description = req.body.description;
    const pic = req.files.file;
    const picData = pic.data;
    const encodedPic = picData.toString('base64');
    const imageBuffer = Buffer.from(encodedPic, 'base64')
    const review = {
      name,
      companyName,
      designation,
      description,
      img: imageBuffer
    }
    const result = await reviewCollection.insertOne(review);
    res.send(result)
  })

  // app.get('/review', (req, res) => {
  //   reviewCollection.find()
  //     .toArray((err, allReview) => {
  //       res.send(allReview)
  //     })
  // })
  app.get('/review', (req, res) => {
    reviewCollection.find()
      .toArray((err, allReview) => {
        res.send(allReview)
      })
  })

  app.post('/make-admin', (req, res) => {
    const admin = req.body;
    // console.log(admin)
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/admin-list', (req, res) => {
    adminCollection.find()
      .toArray((err, admin) => {
        res.send(admin)
      })
  })

  app.delete('/delete-admin/:id', (req, res) => {
    adminCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(result);
      })
  })

  app.post('/add-moderator', (req, res) => {
    const moderator = req.body;
    // console.log(admin)
    moderatorCollection.insertOne(moderator)
      .then(result => {
        res.send(result)
      })
  })

  app.get('/moderator-list', (req, res) => {
    moderatorCollection.find()
      .toArray((err, moderator) => {
        res.send(moderator)
      })
  })

  app.delete('/delete-moderator/:id', (req, res) => {
    moderatorCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(result);
      })
  })

  app.post('/isAdmin', async (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  })

  app.post('/isModerator', async (req, res) => {
    const email = req.body.email;
    moderatorCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  })

  app.post('/booking-list-by-email', (req, res) => {
    const data = req.body;
    const email = req.body.email;
    // console.log(req.body.email)

    adminCollection.find({ email: email })
      .toArray((err, admins) => {
        const filter = { data: data.data }
        // console.log(filter)
        if (admins.length === 0) {
          filter.email = email;
        }

        bookingCollection.find(filter)
          .toArray((err, documents) => {
            res.send(documents)
          })
      })

  })

});

app.listen(process.env.PORT || port);