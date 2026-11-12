const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ các file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ĐỊNH TUYẾN CÁC TRANG HTML ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/doctors', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doctors.html'));
});

app.get('/diseases', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'diseases.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ==================== CÁC API NHẬN DỮ LIỆU TỪ NÚT BẤM (FORM) ====================

// 1. API nhận dữ liệu đặt lịch từ trang booking.html
app.post('/api/appointments', async (req, res) => {
    try {
        const { patientName, phone, service, doctor, appointmentDate, timeSlot } = req.body;
        const apptCode = 'LK-' + Math.floor(1000 + Math.random() * 9000);
        
        // Lưu vào cơ sở dữ liệu PostgreSQL (Neon) thông qua Prisma
        const newAppointment = await prisma.appointment.create({
            data: { patientName, phone, service, doctor, appointmentDate, timeSlot, apptCode }
        });

        res.status(201).json({ success: true, apptCode, newAppointment });
    } catch (error) {
        console.error('Lỗi lưu lịch hẹn:', error);
        res.status(500).json({ error: 'Không thể lưu lịch hẹn vào cơ sở dữ liệu' });
    }
});

// 2. API nhận dữ liệu đăng nhập từ trang login.html
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Kiểm tra thông tin tài khoản admin cơ bản
        if (email === "admin@phongkham.com" && password === "123456") {
            res.status(200).json({ success: true, message: "Đăng nhập thành công" });
        } else {
            res.status(401).json({ error: "Sai thông tin email hoặc mật khẩu" });
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ error: 'Lỗi server đăng nhập' });
    }
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});
