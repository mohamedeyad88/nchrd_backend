import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Box, TextField, MenuItem, Rating, Typography, Grid, Chip 
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  
  // القيم الافتراضية للتقييم (0 من 5)
  const initialForm = { 
    student: '', 
    company: '', 
    punctuality: 3, 
    behavior: 3, 
    practical_skills: 3, 
    learning_level: 3, 
    performance_quality: 3, 
    teamwork: 3,
    notes: '',
    result: 'competent'
  };
  
  const [formData, setFormData] = useState(initialForm);

  // الأعمدة
  const columns = [
    { field: 'id', headerName: '#' },
    { 
      field: 'student', 
      headerName: 'الطالب',
      render: (row) => students.find(s => s.id === row.student)?.name || row.student 
    },
    { 
      field: 'result', 
      headerName: 'النتيجة',
      render: (row) => (
        <Chip 
          label={row.result === 'competent' ? 'جدير' : 'غير جدير'} 
          color={row.result === 'competent' ? 'success' : 'error'} 
          size="small" 
        />
      )
    },
    { field: 'date', headerName: 'تاريخ التقييم' }
  ];

  // جلب البيانات
  const fetchData = async () => {
    try {
      const [evalRes, studRes, compRes] = await Promise.all([
        api.get('evaluations/'),
        api.get('students/'),
        api.get('companies/')
      ]);
      setEvaluations(evalRes.data);
      setStudents(studRes.data);
      setCompanies(compRes.data);
    } catch (err) {
      toast.error("فشل تحميل البيانات");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      await api.post('evaluations/', formData);
      toast.success("تم حفظ التقييم بنجاح");
      setOpen(false);
      fetchData();
    } catch (err) {
      toast.error("حدث خطأ! تأكد من اختيار الطالب والشركة");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا التقييم؟")) {
      try {
        await api.delete(`evaluations/${id}/`);
        toast.success("تم الحذف");
        fetchData();
      } catch (err) {
        toast.error("فشل الحذف");
      }
    }
  };

  const openAdd = () => {
    setFormData(initialForm);
    setOpen(true);
  };

  // مكون بسيط لسطر التقييم
  const RatingRow = ({ label, field }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography component="legend">{label}</Typography>
      <Rating
        name={field}
        value={formData[field]}
        onChange={(event, newValue) => {
          setFormData({ ...formData, [field]: newValue });
        }}
      />
    </Box>
  );

  return (
    <Box>
      <PageHeader title="📝 التقييمات" btnLabel="تقييم جديد" onAdd={openAdd} />
      
      <DataTable columns={columns} rows={evaluations} onDelete={handleDelete} onEdit={() => toast.info("التعديل غير متاح حالياً")} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة تقييم جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* البيانات الأساسية */}
            <Grid item xs={12} md={6}>
              <TextField
                select label="الطالب" fullWidth value={formData.student}
                onChange={(e) => {
                    // تعبئة الشركة تلقائياً عند اختيار الطالب
                    const selectedStudent = students.find(s => s.id === e.target.value);
                    setFormData({ ...formData, student: e.target.value, company: selectedStudent?.company || '' });
                }}
              >
                {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select label="الشركة" fullWidth value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled // الشركة تأتي تلقائياً من الطالب
              >
                {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>

            {/* معايير التقييم */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #444', borderRadius: 2, p: 2, mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>معايير التقييم</Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <RatingRow label="الالتزام بالمواعيد" field="punctuality" />
                        <RatingRow label="السلوك والمظهر" field="behavior" />
                        <RatingRow label="المهارات العملية" field="practical_skills" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RatingRow label="مستوى التعلم" field="learning_level" />
                        <RatingRow label="جودة الأداء" field="performance_quality" />
                        <RatingRow label="العمل ضمن فريق" field="teamwork" />
                    </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* النتيجة النهائية والملاحظات */}
            <Grid item xs={12} md={6}>
               <TextField
                select label="النتيجة النهائية" fullWidth value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                sx={{ mt: 2 }}
              >
                <MenuItem value="competent">جدير</MenuItem>
                <MenuItem value="not_competent">غير جدير</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="ملاحظات إضافية" fullWidth multiline rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    sx={{ mt: 2 }}
                />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ التقييم</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Evaluations;