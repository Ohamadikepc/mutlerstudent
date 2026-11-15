'use strict';
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Student } = require('../models');
const fs = require('fs');


const collectFiles = (req) => {
    const files = [];

    if (req.file) {
        files.push(req.file);
    }

    if (Array.isArray(req.files)) {
        files.push(...req.files);
    } else if (req.files) {
        Object.values(req.files).forEach((group) => {
            files.push(...group);
        });
    }

    return files;
};


exports.removeUploadedFiles = (req) => {
    collectFiles(req).forEach((file) => {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    });
};

exports.validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        exports.removeUploadedFiles(req);
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    next();
};

exports.createStudentRules = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email')
        .trim()
        .isEmail().withMessage('Email must be valid')
        .custom(async (value) => {
            const existing = await Student.findOne({ where: { email: value } });
            if (existing) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('department').trim().notEmpty().withMessage('Department is required')
];

exports.updateStudentRules = [
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email must be valid')
        .custom(async (value, { req }) => {
            const existing = await Student.findOne({
                where: { email: value, id: { [Op.ne]: req.params.id } }
            });
            if (existing) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty')
];

exports.studentIdRule = [
    param('id')
        .isInt().withMessage('Student ID must be a number')
        .custom(async (value) => {
            const student = await Student.findByPk(value);
            if (!student) {
                throw new Error('Student does not exist');
            }
            return true;
        })
];