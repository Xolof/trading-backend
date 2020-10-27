var express = require("express");
var router = express.Router();
const path = require("path");
var fs = require("fs");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../models/auth.js");
const checkToken = auth.checkToken;

const db = require("../models/db.js");
const priceinfo = require("../models/priceinfo.js");

router.get("/", (req, res, next) => {
    db.getItems()
        .then(rows => {
            if (!rows) {
                return res.status(404).json({
                    data: {
                        status: 404,
                        title: "Not found"
                    }
                });
            }

            return res.status(200).json({
                data: {
                    status: 200,
                    items: rows,
                }
            });
        })
        .catch(err => {
            return res.status(500).json({
                errors: {
                    status: 500,
                    title: "Database error",
                    detail: err.message
                }
            });
        })
});

router.get("/img/:image", (req, res, next) => {
    let imageName = req.params.image;

    fs.promises.readdir(path.join(__dirname, "../img"), (err, images) => {
        return images;
    }).then((images) => {
        if (images.includes(imageName)) {
            return res.sendFile(path.join(__dirname, "../img", imageName));
        }
        return res.status(404).send("File not found");
    });
});

router.post("/register", (req, res, next) => {

    // Regex for email and card.
    var emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var cardRe = /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;

    if (emailRe.test(req.body.email) && cardRe.test(req.body.card) && req.body.password.length >= 5) {
        let salt = bcrypt.genSaltSync(10);

        let hash = bcrypt.hashSync(req.body.password, salt);

        return db.register(req.body.email, hash, req.body.card)
            .then(result => {
                res.status(201).json({
                    data: {
                        status: 201,
                        msg: "User created."
                    }
                });
            })
            .catch(err => {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Database error",
                        detail: err.message
                    }
                });
            })
    }

    res.status(404).json({
        errors: {
            status: 404,
            details: "Registration failed."
        }
    });

});

router.post("/login", (req, res) => {
    db.getUser(req.body.email)
    .then(result => {
        if (!result) {
            return res.status(404).json({
                errors: {
                    status: 404,
                    title: "User does not exist."
                }
            });
        }

        // comparing passsword with hash
        if (!bcrypt.compareSync(req.body.password, result.password)) {
            return res.status(404).json({
                errors: {
                    status: 404,
                    details: "Login failed. Check email and password."
                }
            });
        };

        const payload = { email: req.body.email };

        const secret = process.env.JWT_SECRET;

        const token = jwt.sign(payload, secret, { expiresIn: "1h" });

        const data = {
            data: {
                status: 200,
                msg: "Login successful.",
                token: token
            }
        };

        db.getUserInfo(req.body.email)
        .then(result => {
            data.userInfo = result;
            return res.json(data);
        })
    })
    .catch(err => {
        return res.status(500).json({
            errors: {
                status: 500,
                title: "Database error",
                detail: err.message
            }
        });
    })
});

router.post("/userinfo", (req, res) => {
    let useremail = checkToken(req, res);

    if (typeof useremail === "string") {
        db.getUserInfo(useremail)
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            return res.status(500).json({
                errors: {
                    status: 500,
                    title: "Database error",
                    detail: err.message
                }
            });
        });
    }
});

router.post("/buy", (req, res) => {
    async function main() {
        let useremail = checkToken(req, res);
        if (typeof useremail === "string") {

            let item_id = req.body.item_id;
            let quantity = parseInt(req.body.quantity);

            if (quantity <= 0 || isNaN(quantity)) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Invalid quantity",
                        detail: "Invalid quantity"
                    }
                });
            }

            // Get price of item from socket-service
            let price = priceinfo.prices.filter((bulb) => {
                return bulb.id === parseInt(item_id);
            })[0].startingPoint;

            // Calculate total price
            let totalprice = price * quantity;

            let balance = await db.getBalance(useremail).then(row => {
                if (!row) {
                    return res.status(404).json({
                        data: {
                            status: 404,
                            title: "Not found"
                        }
                    });
                }

                return row.balance;
            })
            .catch(err => {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Database error",
                        detail: err.message
                    }
                });
            });

            // Check if user has sufficient balance
            if (balance - totalprice > -1) {
                db.buy(totalprice, useremail, item_id, quantity)
                .then(result => {
                    db.getUserInfo(useremail)
                        .then(userInfo => {
                            return res.status(200).json(userInfo);
                        })
                })
                .catch(err => {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                });
            } else {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Insufficient balance",
                        detail: "Insufficient balance"
                    }
                });
            }
        }
    }
    main();
});


router.post("/sell", (req, res) => {
    async function main() {

        let useremail = checkToken(req, res);

        if (typeof useremail === "string") {

            let item_id = req.body.item_id;
            let quantity = parseInt(req.body.quantity);

            if (quantity <= 0 || isNaN(quantity)) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Invalid quantity",
                        detail: "Invalid quantity"
                    }
                });
            }

            // Get price of item from socket-service
            let price = priceinfo.prices.filter((bulb) => {
                return bulb.id === parseInt(item_id);
            })[0].startingPoint;

            // Calculate total price
            let totalprice = price * quantity;

            let usersItemQuantity = await db.getItemQuantity(useremail, item_id)
                .then(row => {
                    if (!row) {
                        return 0;
                    }
                    return row.quantity;
                })
                .catch(err => {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            title: "Database error",
                            detail: err.message
                        }
                    });
                });

            if (quantity <= usersItemQuantity) {
                db.sell(totalprice, useremail, item_id, quantity)
                    .then(result => {
                        db.getUserInfo(useremail)
                            .then(userInfo => {
                                return res.status(200).json(userInfo);
                            })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                title: "Database error",
                                detail: err.message
                            }
                        });
                    });
            } else {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        title: "Insufficient quantity",
                        detail: "Insufficient quantity"
                    }
                });
            }
        }
    }
    main();
});


router.put("/refill", (req, res) => {
    let useremail = checkToken(req, res);

    if (req.body.amount <= 0) {
        return res.status(500).json({
            errors: {
                status: 500,
                title: "Invalid amount",
                detail: "Invalid amount"
            }
        });
    }

    if (typeof useremail === "string") {
        db.refill(useremail, req.body.amount)
        .then(result => {
            db.getUserInfo(useremail)
                .then(userInfo => {
                    return res.status(200).json(userInfo);
                })
        })
        .catch(err => {
            return res.status(500).json({
                errors: {
                    status: 500,
                    title: "Database error",
                    detail: err.message
                }
            });
        })
    }
});

module.exports = router;

// router.put("/user", (req, res, next) => {
//     // 204 No Content
//     res.status(204).send();
// });
//
// router.delete("/user", (req, res, next) => {
//     // 204 No Content
//     res.status(204).send();
// });
