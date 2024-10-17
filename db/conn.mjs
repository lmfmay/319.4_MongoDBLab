import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

//create connection string
const connectionString = process.env.atlasURI || '';

const client = new MongoClient(connectionString);

//variable to hold connection info
let conn;

try {
    //try to connect to client
    conn = await client.connect()
    console.log('MongoDB is connected');
} catch (error) {
    console.error(error)
}

let db = conn.db('sample_training');

export default db;