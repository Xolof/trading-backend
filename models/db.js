const Database = require('sqlite-async');

function openDB() {
    // For testing environment
    if (process.env.NODE_ENV === 'test') {
        return Database.open('./db/test.sqlite')
        .then(db => {
            return db;
        })
        .catch(err => {
            console.error(err);
        });
    }

    return Database.open('./db/trading.sqlite')
    .then(db => {
        return db;
    })
    .catch(err => {
        console.error(err);
    });
}

async function getUser(email) {
    let db = await openDB();

    return db.get("SELECT * FROM user WHERE email = ?", email).then(row => {
        return row;
    });
}

async function getUserInfo(email) {
    let db = await openDB();

    let result = {};

    await Promise.all([
        db.all("SELECT itemid, quantity FROM user2item WHERE useremail = ?", email).then(row => {
            result.items = row;
        }),
        db.get("SELECT balance, card FROM user WHERE email = ?", email).then(row => {
            result.balance = row.balance;
            result.card = "XXX-XXX-XXX-" + row.card.slice(row.card.length - 3)
        })
    ]);

    return result;
}

async function getBalance(useremail) {
    let db = await openDB();

    return db.get(
        "SELECT balance FROM user WHERE email = ?",
        useremail
    );
}

async function buy(totalprice, useremail, item_id, quantity) {
    let db = await openDB();

    let usersRowCount = await db.get("SELECT COUNT(*) FROM user2item WHERE useremail = ? AND itemid = ?",
        useremail, item_id);

    let itemQuery = "";

    if (usersRowCount["COUNT(*)"] > 0) {
        itemQuery = "UPDATE user2item SET quantity = quantity + ? WHERE useremail = ? AND itemid = ?;";
    } else {
        itemQuery = "INSERT INTO user2item (quantity, useremail, itemid) VALUES (?, ?, ?);";
    }

    return db.transaction(db => {
        return Promise.all([
            db.run('UPDATE user SET balance = (balance - ?) WHERE email = ?;',
                totalprice,
                useremail,
            ),
            db.run(itemQuery,
                quantity,
                useremail,
                item_id,
            )
        ]);
    });
}

async function sell(totalprice, useremail, item_id, quantity) {
    let db = await openDB();

    let usersQuantity = await db.get("SELECT quantity FROM user2item WHERE useremail = ? AND itemid = ?",
        useremail, item_id);

    let runArray = [
        db.run('UPDATE user SET balance = (balance + ?) WHERE email = ?;',
            totalprice,
            useremail,
        )
    ];

    if (usersQuantity.quantity - quantity == 0) {
        runArray.push(db.run(`DELETE FROM user2item WHERE itemid = ? AND useremail = ?;`,
            item_id,
            useremail,
        ));
    } else {
        runArray.push(db.run(`UPDATE user2item SET quantity = quantity - ? WHERE useremail = ? AND itemid = ?`,
            quantity,
            useremail,
            item_id,
        ));
    }

    return db.transaction(db => {
        return Promise.all(runArray);
    });
}

async function getItemQuantity(useremail, item_id) {
    let db = await openDB();

    return db.get(
        "SELECT quantity FROM user2item WHERE useremail = ? AND itemid = ?",
        useremail,
        item_id
    );
}

async function refill(useremail, amount) {
    let db = await openDB();

    return db.run(`UPDATE user SET balance = balance + ? WHERE email = ?`,
        amount,
        useremail
    );
}

async function getItems() {
    let db = await openDB();

    return db.all("SELECT * FROM item");
}

async function register(useremail, hash, card) {
    let db = await openDB();

    return db.run(
        "INSERT INTO user (email, password, balance, card) VALUES (?, ?, ?, ?)",
        useremail,
        hash,
        0,
        card,
    );
}

module.exports = {
    getItems,
    getUser,
    getUserInfo,
    getBalance,
    getItemQuantity,
    buy,
    sell,
    refill,
    register,
}
