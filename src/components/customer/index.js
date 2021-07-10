import { useEffect, useState, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DataGrid } from '@material-ui/data-grid';
import cache from 'memory-cache';
import { isNull } from 'lodash';
import {
   faPenAlt,
   faPlusCircle,
   faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { addNewCustomer, getAllCustomer } from 'api/customer';
import SnackBar from 'components/Common/SnackBar';
import EditCustomerDiaLog from './EditCustomerDialog';
import AddCustomerDialog from './AddCustomerDialog';
import DeleteDialog from './DeleteCustomerDialog';

function Customer() {
   const [openEditDialog, setOpenEditDialog] = useState(false);

   const [openAddDialog, setOpenAddDialog] = useState(false);

   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const [openSnackBar, setOpenSnackBar] = useState(false);

   const [snackBarMessage, setSnackBarMessage] = useState('');

   const [loading, setLoading] = useState(true);

   const [selectedRow, setSelectedRow] = useState({});

   const [rows, setRows] = useState([]);

   const columns = useMemo(
      () => [
         { field: 'id', headerName: 'ID', width: 90 },
         { field: 'name', headerName: 'Name', width: 150 },
         {
            field: 'address',
            headerName: 'Address',
            width: 150,
         },
         {
            field: 'phoneNumber',
            headerName: 'Phone',
            width: 150,
         },
         {
            field: 'email',
            headerName: 'Email',
            type: 'number',
            width: 150,
         },
         {
            field: 'edit',
            headerName: 'Edit',
            width: 110,
            renderCell: params => (
               <button
                  className="data-grid-btn edit-btn"
                  onClick={editButtonClick}
               >
                  <FontAwesomeIcon icon={faPenAlt}></FontAwesomeIcon>
                  <span>Edit</span>
               </button>
            ),
         },
         {
            field: 'delete',
            headerName: 'Delete',
            width: 130,
            renderCell: params => (
               <button
                  className="data-grid-btn delete-btn"
                  onClick={deleteButtonClick}
               >
                  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                  <span>Delete</span>
               </button>
            ),
         },
      ],
      []
   );

   async function fetchAllCustomer() {
      let data;
      const cacheMemo = cache.get('api/customer');
      if (cacheMemo) {
         data = cacheMemo;
      } else {
         data = await getAllCustomer();
      }

      if (isNull(data)) {
         setOpenSnackBar(true);
         setLoading(false);
         setSnackBarMessage('Fail to get data');
      } else {
         cache.put('api/customer', data, 1000000);
         setRows(data);
         setLoading(false);
         setOpenSnackBar(false);
      }
   }

   const editButtonClick = el => {
      setOpenEditDialog(true);
   };

   const deleteButtonClick = el => {
      setOpenDeleteDialog(true);
   };

   const handleCellClick = el => {
      setSelectedRow(el.row);
   };

   const closeEditDialog = (editBook, isCancel) => {
      setOpenEditDialog(false);
   };

   const addBookClick = () => {
      setOpenAddDialog(true);
   };

   const closeAdddDialog = async (newCustomer, isCancel) => {
      setOpenAddDialog(false);
      if (!isCancel) {
         const res = await addNewCustomer(newCustomer);
         if (res) {
            setLoading(true);
            setSnackBarMessage('Action complete loading data...');
            setOpenSnackBar(true);
            cache.clear();
            setTimeout(fetchAllCustomer(), 2000);
         } else {
            setSnackBarMessage('An occur error happen, please try later');
            setOpenSnackBar(true);
         }
      }
   };

   const closeDeleteDialog = isConfirm => {
      setOpenDeleteDialog(false);
   };

   useEffect(() => {
      fetchAllCustomer();
   }, []);

   return (
      <div className="data-grid">
         <div className="table">
            {loading && (
               <div className="loading-row">
                  <p>Loading...</p>
                  <div className="lds-ellipsis">
                     <div></div>
                     <div></div>
                     <div></div>
                     <div></div>
                  </div>
               </div>
            )}

            <div className="outside-button">
               <button
                  onClick={addBookClick}
                  className="add-button data-grid-btn"
               >
                  <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
                  <span>Add new customer</span>
               </button>
            </div>
            <DataGrid
               onCellClick={handleCellClick}
               rows={rows}
               columns={columns}
               pageSize={5}
            />
         </div>
         <EditCustomerDiaLog
            openEditDialog={openEditDialog}
            customer={selectedRow}
            closeEditDialog={closeEditDialog}
         ></EditCustomerDiaLog>
         <AddCustomerDialog
            openAddDialog={openAddDialog}
            closeAddDialog={closeAdddDialog}
         ></AddCustomerDialog>
         <DeleteDialog
            closeDeleteDialog={closeDeleteDialog}
            openDeleteDialog={openDeleteDialog}
         ></DeleteDialog>
         <SnackBar
            openSnackBar={openSnackBar}
            message={snackBarMessage}
         ></SnackBar>
      </div>
   );
}

export default memo(Customer);
