import express from 'express';
import db from '../db/conn.mjs';
import gradesController from '../controllers/gradesController.mjs';

const router = express.Router();

//routes
//get grades by ID
router.route('/:id')
    .get(gradesController.getSingleGrade);

//get student by id
router.route('/student/:id')
    .get(gradesController.getStudentGrades);

//get class by id
router.route('/class/:id')
    .get(gradesController.getClassGrades);

//create new grade
router.route('/')
    .post(gradesController.createGrade);

//get weighted avg for learner across all classes
router.route('/student/:id/avg')
    .get(gradesController.studentClassesAvg)

export default router;