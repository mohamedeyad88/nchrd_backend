import { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Typography, MenuItem, FormControl, InputLabel, Select, Chip, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../services/api';

const Students = () => {
  // --- States ---
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]); // عشان الـ Dropdown
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    national_id: '',
    phone: '',
    status: 'active',
    company: '',
    personal_photo: null // للصورة
  });

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const [studentsRes, companiesRes] = await Promise.all([
        api.get('students/'),
        api.get('companies/')
      ]);
      setStudents(studentsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("فشل تحميل البيانات");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleOpen = () => {
    setEditMode(false);
    setFormData({ name: '', national_id: '', phone: '', status: 'active', company: '', personal_photo: null });
    setOpen(true);
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setCurrentId(student.id);
    setFormData({
      name: student.name,
      national_id: student.national_id,
      phone: student.phone,
      status: student.status,
      company: student.company,
      personal_photo: null // الصورة لا نعدلها إلا لو رفع جديدة
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      try {
        await api.delete(`students/${id}/`);
        toast.success("تم الحذف بنجاح");
        fetchData();
      } catch (error) {
        toast.error("فشل الحذف (ربما ليس لديك صلاحية)");
      }
    }
  };

  const handleSubmit = async () => {
    // نستخدم FormData عشان الصورة
    const data = new FormData();
    data.append('name', formData.name);
    data.append('national_id', formData.national_id);
    data.append('phone', formData.phone);
    data.append('status', formData.status);
    data.append('company', formData.company);
    if (formData.personal_photo) {
      data.append('personal_photo', formData.personal_photo);
    }

    try {
      if (editMode) {
        await api.put(`students/${currentId}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("تم التعديل بنجاح");
      } else {
        await api.post('students/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("تمت الإضافة بنجاح");
      }
      handleClose();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  // دالة مساعدة لعرض حالة الطالب بشكل جميل
  const getStatusChip = (status) => {
    const map = {
      'active': { label: 'نشط', color: 'success' },
      'suspended': { label: 'متوقف', color: 'error' },
      'graduated': { label: 'خريج', color: 'info' },
    };
    const s = map[status] || { label: status, color: 'default' };
    return <Chip label={s.label} color={s.color} size="small" />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          👨‍🎓 إدارة الطلاب
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          إضافة طالب
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.paper' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>الصورة</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>الرقم القومي</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>الموبايل</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>الشركة</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              // نوجد اسم الشركة من الـ ID
              const compName = companies.find(c => c.id === student.company)?.name || '-';
              return (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Avatar src={student.personal_photo} alt={student.name} />
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.national_id}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{compName}</TableCell>
                  <TableCell>{getStatusChip(student.status)}</TableCell>
                  <TableCell>
                    <IconButton color="info" size="small" onClick={() => handleEdit(student)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(student.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">لا يوجد طلاب مسجلين</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog (Popup Form) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="الاسم"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="الرقم القومي"
              fullWidth
              value={formData.national_id}
              onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            />
            <TextField
              label="رقم الهاتف"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            
            {/* حقل اختيار الشركة */}
            <FormControl fullWidth>
              <InputLabel>الشركة / المؤسسة</InputLabel>
              <Select
                value={formData.company}
                label="الشركة / المؤسسة"
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              >
                {companies.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* حقل الحالة */}
            <FormControl fullWidth>
              <InputLabel>حالة الطالب</InputLabel>
              <Select
                value={formData.status}
                label="حالة الطالب"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="suspended">متوقف</MenuItem>
                <MenuItem value="graduated">خريج</MenuItem>
              </Select>
            </FormControl>

            {/* رفع الصورة */}
            <Button variant="outlined" component="label">
               رفع صورة شخصية
              <input 
                type="file" 
                hidden 
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, personal_photo: e.target.files[0] })} 
              />
            </Button>
            {formData.personal_photo && <Typography variant="caption">تم اختيار ملف: {formData.personal_photo.name}</Typography>}
            
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;