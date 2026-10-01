"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { getAllUsers } from "@/redux/slices/user";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CustomerList() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/user/delete-user/${id}`);
      toast.success(data.message);
      dispatch(getAllUsers());
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    }
  };

  const customers = (users || []).filter((u) => u.role !== "business_owner");

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.phoneNumber || "-"}</TableCell>
              <TableCell>{item.createdAt?.slice(0, 10)}</TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setUserId(item._id);
                    setOpen(true);
                  }}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="size-[18px]" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted">
                No customers yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {open && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-4">
          <Card variant="solid" className="w-full max-w-md p-6 text-center">
            <h3 className="py-4 text-lg text-content">Delete this customer?</h3>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setOpen(false);
                  handleDelete(userId);
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
