import Database from "better-sqlite3";

const db = new Database(`DB-grade-exam`, {verbose: console.log});