import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Typography, Box 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

//columns: مصفوفة تعرف شكل الأعمدة
// rows: البيانات
// onEdit/onDelete: دوال التحكم
const DataTable = ({ columns, rows, onEdit, onDelete }) => {
  
  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">لا توجد بيانات لعرضها</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: 'background.paper' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {col.headerName}
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              {columns.map((col) => (
                <TableCell key={`${row.id}-${col.field}`}>
                  {/* لو العمود فيه دالة render مخصصة (زي الصورة) استخدمها، وإلا اعرض النص عادي */}
                  {col.render ? col.render(row) : row[col.field] || '-'}
                </TableCell>
              ))}
              <TableCell>
                <IconButton color="info" size="small" onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" size="small" onClick={() => onDelete(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;