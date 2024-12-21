require('dotenv').config(); // 가장 상단에 위치
const express = require('express');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, // DB 이름
    process.env.DB_USER, // 사용자 이름
    process.env.DB_PASSWORD, // 비밀번호
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql', // MySQL 사용
    }
);

module.exports = sequelize;