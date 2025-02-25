import Database from "better-sqlite3";

const db = new Database(`Övning ERD Techgear.db`, {verbose: console.log});

export default db;