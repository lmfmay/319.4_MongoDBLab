import db from '../db/conn.mjs';
import { ObjectId } from 'mongodb';

//get single grade entry by id
// async function getSingleGrade(req, res) {
//   try {
//     //specify collection
//     let collection = await db.collection('grades');
//     //specify action
//     let query = { _id: new ObjectId(req.params.id) };
//     let result = await collection.findOne(query);
//     //return results
//     res.json(result);
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ msg: 'Server error' })
//   }
// }

//get grades by student id
async function getStudentGrades(req, res) {
  try {
    //specify collection
    let collection = await db.collection('grades');
    //specify action
    let query = { student_id: Number(req.params.id) };
    let results = await collection.find(query).toArray();
    //return results
    res.json(results);
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }

}

//get grades by class id
async function getClassGrades(req, res) {
  try {
    //specify collection
    let collection = await db.collection('grades');
    //specify action
    let query = { class_id: Number(req.params.id) };
    let results = await collection.find(query).toArray();
    //return results
    res.json(results);
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }

}

//create new grades in db
async function createGrade(req, res) {
  try {
    let collection = await db.collection('grades');
    let result = await collection.insertOne(req.body);
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }
}

//all class averages for one learner
async function studentClassesAvg(req, res) {
  try {
    let collection = await db.collection('grades');
    let result = await collection.aggregate([
      {
        $match: { student_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
      // {
      //   $group: {
      //     _id: null,
      //     avg: {
      //       $avg: "$avg"
      //     },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,  // Exclude _id from final result
      //     avg: 1   // Include the average in the result
      //   }
      // }
    ]).toArray();
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }
}

async function learnersPassing(req, res) {
  try {
    let collection = await db.collection('grades');

    let results = await collection.aggregate([
        {
          '$unwind': {
            'path': '$scores'
          }
        }, {
          '$group': {
            '_id': {
              'student_id': '$student_id', 
              'class_id': '$class_id'
            }, 
            'weighted_average': {
              '$sum': {
                '$switch': {
                  'branches': [
                    {
                      'case': {
                        '$eq': [
                          '$scores.type', 'exam'
                        ]
                      }, 
                      'then': {
                        '$multiply': [
                          '$scores.score', 0.5
                        ]
                      }
                    }, {
                      'case': {
                        '$eq': [
                          '$scores.type', 'quiz'
                        ]
                      }, 
                      'then': {
                        '$multiply': [
                          '$scores.score', 0.3
                        ]
                      }
                    }, {
                      'case': {
                        '$eq': [
                          '$scores.type', 'homework'
                        ]
                      }, 
                      'then': {
                        '$multiply': [
                          '$scores.score', 0.2
                        ]
                      }
                    }
                  ], 
                  'default': 0
                }
              }
            }
          }
        }, {
          '$group': {
            '_id': '$_id.student_id', 
            'overall_weighted_average': {
              '$avg': '$weighted_average'
            }
          }
        }, {
          '$group': {
            '_id': null, 
            'totalLearners': {
              '$sum': 1
            }, 
            'learnersAbove70': {
              '$sum': {
                '$cond': {
                  'if': {
                    '$gt': [
                      '$overall_weighted_average', 70
                    ]
                  }, 
                  'then': 1, 
                  'else': 0
                }
              }
            }
          }
        }, {
          '$project': {
            '_id': 0, 
            'totalLearners': 1, 
            'learnersAbove70': 1, 
            'percentageAbove70': {
              '$multiply': [
                {
                  '$divide': [
                    '$learnersAbove70', '$totalLearners'
                  ]
                }, 100
              ]
            }
          }
        }
      ]).toArray();
    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }
}


//helper function
//aggregation pipeline to get weighted average
// function studentClassesAvgPipeline(student_id) {
//   const pipeline = [
//     {
//       $match: { student_id: student_id },
//     },
//     {
//       $unwind: { path: "$scores" },
//     },
//     {
//       $group: {
//         _id: "$class_id",
//         quiz: {
//           $push: {
//             $cond: {
//               if: { $eq: ["$scores.type", "quiz"] },
//               then: "$scores.score",
//               else: "$$REMOVE",
//             },
//           },
//         },
//         exam: {
//           $push: {
//             $cond: {
//               if: { $eq: ["$scores.type", "exam"] },
//               then: "$scores.score",
//               else: "$$REMOVE",
//             },
//           },
//         },
//         homework: {
//           $push: {
//             $cond: {
//               if: { $eq: ["$scores.type", "homework"] },
//               then: "$scores.score",
//               else: "$$REMOVE",
//             },
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         class_id: "$_id",
//         avg: {
//           $sum: [
//             { $multiply: [{ $avg: "$exam" }, 0.5] },
//             { $multiply: [{ $avg: "$quiz" }, 0.3] },
//             { $multiply: [{ $avg: "$homework" }, 0.2] },
//           ],
//         },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         avg: {
//           $avg: "$avg"
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,  // Exclude _id from final result
//         avg: 1   // Include the average in the result
//       }
//     }
//   ]
//   return pipeline
// }
//export default { getSingleGrade, getClassGrades, getStudentGrades, createGrade, studentClassesAvg, learnersPassing }
export default { getClassGrades, getStudentGrades, createGrade, studentClassesAvg, learnersPassing }