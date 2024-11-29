const express = require("express");
const bodyParser = require("body-parser");

const users = require("./routes/users");
const posts = require("./routes/posts");

const error = require("./utilities/error");

const app = express();
const port = 3000;

// Getting data
const usersData = require("./data/users");
const postsData = require("./data/posts");
const comments = require("./data/comments");

// Parsing Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// Logging Middlewaare
app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

// Valid API Keys.
apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"];
// to check routes, append '?api-key=perscholas' at the end of each url

// New middleware to check for API keys!
// Note that if the key is not verified,
// we do not call next(); this is the end.
// This is why we attached the /api/ prefix
// to our routing at the beginning!
app.use("/api", function (req, res, next) {
  var key = req.query["api-key"];

  // Check for the absence of a key.
  if (!key) next(error(400, "API Key Required"));

  // Check for key validity.
  if (apiKeys.indexOf(key) === -1) next(error(401, "Invalid API Key"));

  // Valid key! Store it in req.key for route access.
  req.key = key;
  next();
});

// Use our Routes
app.use("/api/users", users);
app.use("/api/posts", posts);

// Adding some HATEOAS links.
app.get("/", (req, res) => {
  res.json({
    links: [
      {
        href: "/api",
        rel: "api",
        type: "GET",
      },
    ],
  });
});

// Comments routes
app.get("/comments", (req, res) => {
  const userId = req.query.userId;
  const postId = req.query.postId;
  if (userId) {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (userId == comments[i].userId) {
        subComments.push(comments[i]);
      }
    }
    res.json(subComments);
  } else if (postId) {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (postId == comments[i].postId) {
        subComments.push(comments[i]);
      }
    }
  } else {
    res.json(comments);
  }
});

app.post("/comments", (req, res) => {
  const comment = req.body;
  comments.push(comment);
});

app.get("/comments/:id", (req, res) => {
  for (let i = 0; i < comments.length; i++) {
    if (req.params.id == comments[i].id) {
      res.json(comments[i]);
    }
  }
});

app.patch("/comments/:id", (req, res) => {
  comments[req.params.id].body = req.body;
  res.json(comments);
});

app.delete("/comments/:id", (req, res) => {
  comments.splice(req.params.id - 1, 1);
  res.json(comments);
});

app.get("/posts/:id/comments", (req, res) => {
  const userId = req.query.userId;
  if (userId) {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (req.params.id == comments[i].postId && userId == comments[i].userId) {
        subComments.push(comments[i]);
      }
    }
    res.json(subComments);
  } else {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (req.params.id == comments[i].postId) {
        subComments.push(comments[i]);
      }
    }
    res.json(subComments);
  }
});

app.get("/users/:id/comments", (req, res) => {
  const postId = req.query.postId;
  if (postId) {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (req.params.id == comments[i].userId && postId == comments[i].postId) {
        subComments.push(comments[i]);
      }
    }
    res.json(subComments);
  } else {
    const subComments = [];
    for (let i = 0; i < comments.length; i++) {
      if (req.params.id == comments[i].userId) {
        subComments.push(comments[i]);
      }
    }
    res.json(subComments);
  }
});

// Adding some HATEOAS links.
app.get("/api", (req, res) => {
  res.json({
    links: [
      {
        href: "api/users",
        rel: "users",
        type: "GET",
      },
      {
        href: "api/users",
        rel: "users",
        type: "POST",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "GET",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "POST",
      },
    ],
  });
});

// 404 Middleware
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"));
});

// Error-handling middleware.
// Any call to next() that includes an
// Error() will skip regular middleware and
// only be processed by error-handling middleware.
// This changes our error handling throughout the application,
// but allows us to change the processing of ALL errors
// at once in a single location, which is important for
// scalability and maintainability.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}.`);
});
