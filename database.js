import Database from "better-sqlite3"; 

import express from "express";

const db = new Database(`Övning ERD Techgear.db`, {verbose: console.log});

export default db;

export {app}

const app = express();
const PORT = 3000;
const URL = "localhost";

app.use(express.json());

app.listen(PORT, URL, () => {

    console.log(`Server is running att ${URL}:${PORT}`);
});
