import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', supervisor_name: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 1. تعريف أعمدة الجدول (هنا يكمن جمال الـ Reusable Component)
  const columns = [
    { field: 'name', headerName: 'اسم المؤسسة' },
    { field: 'address', headerName: 'العنوان' },
    { field: 'phone', headerName: 'الهاتف' },
    { field: 'supervisor_name', headerName: 'المشرف المسؤول' },
    { field: 'student_count', headerName: 'عدد الطلاب' }, // خاصية calculated في الباك اند
  ];

  // 2. جلب البيانات
  const fetchCompanies = async () => {
    try {
      const res = await api.get('companies/');
      setCompanies(res.data);
    } catch (err) {
      toast.error("فشل تحميل بيانات الشركات");
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // 3. دوال التحكم (Handlers)
  const handleSave = async () => {
    if (!formData.name) return toast.warning("اسم الشركة مطلوب");
    
    try {
      if (editMode) {
        await api.put(`companies/${currentId}/`, formData);
        toast.success("تم التحديث بنجاح");
      } else {
        await api.post('companies/', formData);
        toast.success("تمت الإضافة بنجاح");
      }
      setOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المؤسسة؟ سيتم حذف الطلاب المرتبطين بها!")) {
      try {
        await api.delete(`companies/${id}/`);
        toast.success("تم الحذف");
        fetchCompanies();
      } catch (err) {
        toast.error("فشل الحذف");
      }
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', address: '', phone: '', supervisor_name: '' });
    setOpen(true);
  };

  const openEditModal = (row) => {
    setEditMode(true);
    setCurrentId(row.id);
    setFormData({ 
        name: row.name, 
        address: row.address, 
        phone: row.phone, 
        supervisor_name: row.supervisor_name 
    });
    setOpen(true);
  };

  return (
    <Box>
      {/* استخدام المكون الموحد للعنوان */}
      <PageHeader title="🏢 إدارة الشركات" btnLabel="إضافة شركة" onAdd={openAddModal} />

      {/* استخدام الجدول الموحد */}
      <DataTable 
        columns={columns} 
        rows={companies} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      {/* نافذة الإضافة/التعديل (Modal) - يمكن فصلها لمكون FormComponent لاحقاً */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "تعديل بيانات شركة" : "إضافة شركة جديدة"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              label="اسم المؤسسة" fullWidth 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
            <TextField 
              label="العنوان" fullWidth 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
            />
            <TextField 
              label="الهاتف" fullWidth 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
            <TextField 
              label="اسم المشرف بالمؤسسة" fullWidth 
              value={formData.supervisor_name} 
              onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Companies;