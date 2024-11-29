const express = require("express");
const router = express.Router();

const users = require("../data/users");
const posts = require("../data/posts");
const error = require("../utilities/error");

// localhost:3000/api/posts
router
  .route("/")
  .get((req, res) => {
    const queryParam = req.query.userId;
    if (!queryParam) {
      const links = [
        {
          href: "posts/:id",
          rel: ":id",
          type: "GET",
        },
      ];
      res.json({ posts, links });
    } else {
      if (isNaN(Number(queryParam))) {
        res.send("ID is not a number.");
      } else {
        const array = [];
        for (let i = 0; i < posts.length; i++) {
          if (posts[i].userId === Number(queryParam)) {
            array.push(posts[i]);
          }
        }
        if (array.length === 0) {
          res.send("No posts with given user ID.");
        } else {
          res.json(array);
        }
      }
    }
  })
  .post((req, res, next) => {
    if (req.body.userId && req.body.title && req.body.content) {
      const post = {
        id: posts[posts.length - 1].id + 1,
        userId: req.body.userId,
        title: req.body.title,
        content: req.body.content,
      };

      posts.push(post);
      res.json(posts[posts.length - 1]);
    } else next(error(400, "Insufficient Data"));
  });

router
  .route("/:id")
  .get((req, res, next) => {
    const post = posts.find((p) => p.id == req.params.id);

    const links = [
      {
        href: `/${req.params.id}`,
        rel: "",
        type: "PATCH",
      },
      {
        href: `/${req.params.id}`,
        rel: "",
        type: "DELETE",
      },
    ];

    if (post) res.json({ post, links });
    else next();
  })
  .patch((req, res, next) => {
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        for (const key in req.body) {
          posts[i][key] = req.body[key];
        }
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  })
  .delete((req, res, next) => {
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        posts.splice(i, 1);
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  });

module.exports = router;
