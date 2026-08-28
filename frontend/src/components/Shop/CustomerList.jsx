import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete } from "react-icons/ai";
import { Button } from "@material-ui/core";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const CustomerList = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${server}/user/delete-user/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      dispatch(getAllUsers());
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    }
  };

  const columns = [
    { field: "id", headerName: "Customer ID", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
    { field: "email", headerName: "Email", minWidth: 160, flex: 0.9 },
    { field: "phone", headerName: "Phone", minWidth: 120, flex: 0.6 },
    { field: "joinedAt", headerName: "Joined", minWidth: 120, flex: 0.6 },
    {
      field: " ",
      flex: 0.5,
      minWidth: 110,
      headerName: "Delete",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => setUserId(params.id) || setOpen(true)}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const row = [];
  (users || [])
    .filter((u) => u.role !== "business_owner")
    .forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        email: item.email,
        phone: item.phoneNumber || "-",
        joinedAt: item.createdAt?.slice(0, 10),
      });
    });

  return (
    <div className="w-full">
      <div className="bg-surface border border-border rounded-md overflow-x-auto">
        <div className="min-w-[640px]">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-md p-6">
            <div className="flex justify-end">
              <RxCross1
                size={22}
                className="cursor-pointer text-muted"
                onClick={() => setOpen(false)}
              />
            </div>
            <h3 className="text-lg text-center py-4 text-content">
              Delete this customer?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <button
                className="h-[40px] px-5 rounded-md border border-border text-muted"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="h-[40px] px-5 rounded-md bg-brand text-white font-semibold"
                onClick={() => {
                  setOpen(false);
                  handleDelete(userId);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
