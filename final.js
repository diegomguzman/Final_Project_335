const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config({path: path.resolve(__dirname, 'credentials/.env') })  
const databaseAndCollection = {db: "CMSC335_DB", collection:"finalProject"};
const uri = "mongodb+srv://diego:Diego123@cluster0.lxxtcse.mongodb.net/?retryWrites=true&w=majority&appName=cluster0";
process.stdin.setEncoding("utf8");





if (process.argv.length != 3) {
    
    process.exit(0);
}
const portNumber = process.argv[2];
console.log(`Web server is running at https://final-project-335-eqgi.onrender.com:${portNumber}`);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
        /* After invalid command, we cannot type anything else */
            console.log(`Invalid command: ${command}`);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
    
});

const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
 /* app is a request handler function */
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/curJoke", (request, response) => {
    response.render("showJoke",{portNumber});
});

app.get("/genJoke", (request, response) => {
    response.render("generate",{portNumber});
});
app.get("/remJoke", (request, response) => {
    response.render("remove",{portNumber});
});



//save joke
app.post('/saveJoke', async (req, response) => {
    // Extract data from the form
    let {name, email, joke } = req.body;
    response.render("processJoke",{name, email, joke });
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        await insert(client, databaseAndCollection, { name, email, joke });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    
});


//get joke from email
app.get("/showSavedJoke", async (req, response) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        
        const userEmail = req.query.email;
        let entry = await lookUpOneEntry(client, databaseAndCollection, userEmail);

        if (!entry) {
            entry = {name: 'NONE', email: 'NONE', joke: 'NONE'}
            response.render("showSavedJoke",{entry});
        } else {
            response.render("showSavedJoke",{entry});
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    
});

//remove all entries from db
app.post('/processJokeRemove', async (req, response) =>{
    
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        
        const result = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .deleteMany({});
        const num = result.deletedCount;
        response.render("removeConfirmation",{num});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

});

//to look for entry with email that user entered
async function lookUpOneEntry(client, databaseAndCollection, userEmail) {
    let filter = {email: userEmail};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

   if (result) {
       return result
   } else {
       return false;
   }
}

//to insert an entry into the database
async function insert(client, databaseAndCollection, newClient) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newClient);

    
}


app.listen(portNumber)





