import Database from "better-sqlite3"; // Hämtar better-sqlite3

import express from "express"; // Hämtar express

// min databas och verbose som loggar queryn som körs i terminalen.
const db = new Database(`Övning ERD Techgear.db`, {verbose: console.log});

export default db; // Exporterar db filen.

export {app} // Exporterar variablen app för att kunna använda express vid endpoints.

const app = express();
const PORT = 3000;
const URL = "localhost";

// En express middlewere som gör det möjligt att hantera json data.
app.use(express.json());

// Lyssnar på proten och urlen, sedan loggas ett meddelande i terminalen.
app.listen(PORT, URL, () => {

    console.log(`Server is running att ${URL}:${PORT}`);
});
