const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API 1: Đặt lịch khám mới (Lưu vào PostgreSQL Neon)
app.post('/api/appointments', async (req, res) => {
    try {
        const { patientName, phone, service, doctor, appointmentDate, timeSlot, paymentMethod } = req.body;
        const apptCode = 'LK-' + Math.floor(1000 + Math.random() * 9000);

        const newAppointment = await prisma.appointment.create({
            data: {
                code: apptCode,
                patientName: patientName || '',
                phone: phone || '',
                service: service || '',
                doctor: doctor || '',
                appointmentDate: appointmentDate || '',
                timeSlot: timeSlot || '',
                paymentMethod: paymentMethod || '',
                status: 'Chờ khám'
            }
        });

        res.json({ success: true, data: newAppointment });
    } catch (error) {
        console.error('LỖI CHI TIẾT KHI LƯU LỊCH HẸN:', error);
        res.status(500).json({ success: false, message: error.message || 'Khởi tạo lịch hẹn thất bại' });
    }
});

// API 2: Tra cứu lịch hẹn theo số điện thoại
app.get('/api/appointments/search', async (req, res) => {
    try {
        const { phone } = req.query;
        const results = await prisma.appointment.findMany({
            where: { phone: phone },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi truy vấn dữ liệu' });
    }
});

// API 3: Lấy toàn bộ danh sách lịch hẹn (Dành cho Quản trị viên)
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Không lấy được danh sách lịch hẹn' });
    }
});

// API 4: Hủy lịch hẹn
app.delete('/api/admin/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Đã hủy lịch hẹn thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Xóa lịch hẹn thất bại' });
    }
});

// Phục vụ trang chủ index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tự động khởi tạo tài khoản Nhân viên mặc định khi chạy server
async function initDefaultStaff() {
    try {
        const existingStaff = await prisma.user.findFirst({ where: { username: 'nhanvien' } });
        if (!existingStaff) {
            await prisma.user.create({
                data: {
                    username: 'nhanvien',
                    password: '123456',
                    role: 'STAFF'
                }
            });
            console.log('Đã tạo tài khoản nhân viên mặc định: nhanvien / 123456');
        }
    } catch (err) {
        console.log('Khởi tạo user mặc định:', err.message);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await initDefaultStaff();
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});