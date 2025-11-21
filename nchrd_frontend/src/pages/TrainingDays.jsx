import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Box, TextField, MenuItem, Chip 
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const TrainingDays = () => {
  const [days, setDays] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', day_type: 'training' });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // أنواع الأيام (مطابقة للباك اند)
  const dayTypes = [
    { value: 'study', label: 'يوم دراسي', color: 'info' },
    { value: 'official_holiday', label: 'إجازة رسمية', color: 'error' },
    { value: 'training', label: 'تدريب بالشركة', color: 'success' },
    { value: 'closed', label: 'يوم مغلق', color: 'default' },
  ];

  // تعريف الأعمدة
  const columns = [
    { field: 'date', headerName: 'التاريخ' },
    { 
      field: 'day_type', 
      headerName: 'نوع اليوم',
      render: (row) => {
        const type = dayTypes.find(t => t.value === row.day_type) || {};
        return <Chip label={type.label || row.day_type} color={type.color || 'default'} size="small" />;
      }
    }
  ];

  // جلب البيانات
  const fetchData = async () => {
    try {
      const res = await api.get('training-days/');
      setDays(res.data);
    } catch (err) {
      toast.error("فشل تحميل أيام التدريب");
    }
  };

  useEffect(() => { fetchData(); }, []);

  // دوال التحكم
  const handleSave = async () => {
    if (!formData.date) return toast.warning("يجب اختيار التاريخ");

    try {
      if (editMode) {
        await api.put(`training-days/${currentId}/`, formData);
        toast.success("تم التحديث");
      } else {
        await api.post('training-days/', formData);
        toast.success("تمت الإضافة");
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      // عرض رسالة الخطأ من الباك اند (مثلاً: التاريخ مكرر)
      const msg = err.response?.data?.date ? "هذا التاريخ مسجل مسبقاً" : "حدث خطأ";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      try {
        await api.delete(`training-days/${id}/`);
        toast.success("تم الحذف");
        fetchData();
      } catch (err) {
        toast.error("فشل الحذف");
      }
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setFormData({ date: new Date().toISOString().split('T')[0], day_type: 'training' });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditMode(true);
    setCurrentId(row.id);
    setFormData({ date: row.date, day_type: row.day_type });
    setOpen(true);
  };

  return (
    <Box>
      <PageHeader title="📅 أيام التدريب" btnLabel="تسجيل يوم جديد" onAdd={openAdd} />
      
      <DataTable 
        columns={columns} 
        rows={days} 
        onEdit={openEdit} 
        onDelete={handleDelete} 
      />

      {/* نافذة الإضافة / التعديل */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "تعديل اليوم" : "تسجيل يوم جديد"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="التاريخ"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              select
              label="نوع اليوم"
              fullWidth
              value={formData.day_type}
              onChange={(e) => setFormData({ ...formData, day_type: e.target.value })}
            >
              {dayTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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

export default TrainingDays;