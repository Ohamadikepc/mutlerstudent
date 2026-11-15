'use strict';
const { Student } = require('../models');
const fs = require('fs');
const { removeUploadedFiles } = require('../Middleware/studentvalidation');

const removeFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { fullName, email, phone, department } = req.body;

        const data = {
            fullName,
            email,
            phone,
            department,
            profileImage: req.file ? req.file.path : null
        };

        const newStudent = await Student.create(data);

        res.status(201).json({
            message: "Student Added successfully",
            data: newStudent
        });

    } catch (error) {
        removeUploadedFiles(req);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.status(200).json({
            message: 'Student found',
            data: student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll();

        res.status(200).json({
            message: 'All Students',
            data: students
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const { fullName, email, phone, department } = req.body;

        const student = await Student.findByPk(id);
        if (!student) {
            removeUploadedFiles(req);
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        const oldImage = student.profileImage;

        const data = {
            fullName: fullName || student.fullName,
            email: email || student.email,
            phone: phone || student.phone,
            department: department || student.department,
            profileImage: req.file ? req.file.path : oldImage
        };

        await student.update(data);

        if (req.file) {
            removeFile(oldImage);
        }

        res.status(200).json({
            message: 'Student Updated successfully',
            data: student
        });

    } catch (error) {
        removeUploadedFiles(req);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;

        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        const oldFiles = [
            student.profileImage,
            student.passportImage,
            student.identityCardImage,
            ...(student.galleryImages || [])
        ];

        await student.destroy();

        oldFiles.forEach((element) => {
            removeFile(element);
        });

        res.status(200).json({
            message: "Student Deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.uploadGallery = async (req, res) => {
    try {
        const id = req.params.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Please upload at least one gallery image'
            });
        }

        const student = await Student.findByPk(id);
        if (!student) {
            removeUploadedFiles(req);
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        
        const filePaths = req.files.map((el) => el.path);
        
        const files = student.galleryImages || [];
        const galleryImages = files.concat(filePaths);

        await student.update({ galleryImages });

        res.status(200).json({
            message: "Gallery Images Added",
            data: student
        });

    } catch (error) {
        removeUploadedFiles(req);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.uploadImages = async (req, res) => {
    try {
        const id = req.params.id;
        const files = req.files || {};

        if (Object.keys(files).length === 0) {
            return res.status(400).json({
                message: 'Please upload at least one image'
            });
        }

        const student = await Student.findByPk(id);
        if (!student) {
            removeUploadedFiles(req);
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        const data = {};
        const oldFiles = [];

        ['passportImage', 'identityCardImage', 'profileImage'].forEach((field) => {
            if (files[field]) {
                oldFiles.push(student[field]);
                data[field] = files[field][0].path;
            }
        });

        if (files.galleryImages) {
            const newGallery = files.galleryImages.map((el) => el.path);
            const oldGallery = student.galleryImages || [];
            data.galleryImages = oldGallery.concat(newGallery);
        }

        await student.update(data);

        oldFiles.forEach((element) => {
            removeFile(element);
        });

        const uploaded = {};
        Object.keys(files).forEach((field) => {
            uploaded[field] = files[field].map((el) => el.path);
        });

        res.status(200).json({
            message: "Images Uploaded successfully",
            uploaded,
            data: student
        });

    } catch (error) {
        removeUploadedFiles(req);
        res.status(500).json({
            message: error.message
        });
    }
};