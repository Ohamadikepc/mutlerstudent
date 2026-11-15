'use strict';
const express = require('express');
const router = express.Router();

const upload = require('../Middleware/studentupload');
const {
    createStudentRules,
    updateStudentRules,
    studentIdRule,
    validate
} = require('../Middleware/studentvalidation');
const {
    createStudent,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    uploadGallery,
    uploadImages
} = require('../controllers/studentcontroller');


router.post('/', upload.single('profileImage'), createStudentRules, validate, createStudent);

router.get('/', getStudents);

router.get('/:id', studentIdRule, validate, getStudent);

router.put('/:id', upload.single('profileImage'), studentIdRule, updateStudentRules, validate, updateStudent);

router.delete('/:id', studentIdRule, validate, deleteStudent);


router.post('/:id/gallery', upload.array('galleryImages', 5), studentIdRule, validate, uploadGallery);


router.post(
    '/:id/images',
    upload.fields([
        { name: 'passportImage', maxCount: 1 },
        { name: 'identityCardImage', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
        { name: 'galleryImages', maxCount: 5 }
    ]),
    studentIdRule,
    validate,
    uploadImages
);

module.exports = router;