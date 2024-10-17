import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

//get single grade entry by id
async function getSingleGrade(req,res){
    try {
        //specify collection
        let collection = await db.collection('grades');
        //specify action
        let query = {_id: new ObjectId(req.params.id)};
        let result = await collection.findOne(query);
        //return results
        res.json(result);
    } catch (error) {
       console.error(error) 
       res.status(500).json({msg:'Server error'})
    }
}

//get grades by student id
async function getStudentGrades(req,res) {
    try {
        //specify collection
        let collection = await db.collection('grades');
        //specify action
        let query = {student_id: Number(req.params.id)};
        let results = await collection.find(query).toArray();
        //return results
        res.json(results);
    } catch (error) {
        console.error(error) 
        res.status(500).json({msg:'Server error'})
    }
    
}

//get grades by class id
async function getClassGrades(req,res) {
    try {
        //specify collection
        let collection = await db.collection('grades');
        //specify action
        let query = {class_id: Number(req.params.id)};
        let results = await collection.find(query).toArray();
        //return results
        res.json(results);
    } catch (error) {
        console.error(error) 
        res.status(500).json({msg:'Server error'})
    }
    
}

//create new grades in db
async function createGrade(req,res) {
    try {
        let collection = await db.collection('grades');
        let result = await collection.insertOne(req.body);
        res.json(result)
    } catch (error) {
        console.error(error) 
        res.status(500).json({msg:'Server error'})
    }
}

export default {getSingleGrade, getClassGrades, getStudentGrades,createGrade}