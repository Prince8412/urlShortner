const express = require("express");
const mysql = require("mysql");

const app = express();

app.use(express.static("public"));
app.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Qwerty@123",
    database: "shorturls"
});

con.connect(function(error) {
    if (error) {
        console.error("Database connection failed:", error.message);
    } else {
        console.log("Connected to database");
    }
});

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

app.post("/api/create-short-url", function(request, response) {
    let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').substr(2, 10);
    let sql = `INSERT INTO links(longurl, shorturlid) VALUES('${request.body.longurl}', '${uniqueID}')`;
    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error inserting record:", error.message);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            response.status(200).json({
                status: "ok",
                shorturlid: uniqueID
            });
        }
    });
});

app.get("/api/get-all-short-urls", function(request, response) {
    let sql = `SELECT * FROM links`;
    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error retrieving records:", error.message);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            response.status(200).json(result);
        }
    });
});

app.get("/:shorturlid", function(request, response) {
    let shorturlid = request.params.shorturlid;
    let sql = `SELECT * FROM links WHERE shorturlid='${shorturlid}' LIMIT 1`;
    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error retrieving record:", error.message);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            if (result.length > 0) {
                let updateSql = `UPDATE links SET count = count + 1 WHERE id = '${result[0].id}'`;
                con.query(updateSql, function(updateError, updateResult) {
                    if (updateError) {
                        console.error("Error updating record:", updateError.message);
                        response.status(500).json({
                            status: "notok",
                            message: "Something went wrong"
                        });
                    } else {
                        response.redirect(result[0].longurl);
                    }
                });
            } else {
                response.status(404).json({
                    status: "notok",
                    message: "Short URL not found"
                });
            }
        }
    });
});

app.listen(5000, function() {
console.log("Server is running on port 5000");
});
);