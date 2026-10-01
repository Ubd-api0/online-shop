"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import api from "@/lib/axios";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function AllCoupons() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [value, setValue] = useState("");
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  const load = () => {
    setLoading(true);
    api
      .get(`/coupon/get-coupon/${seller._id}`)
      .then((res) => setCoupons(res.data.couponCodes || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (seller?._id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller]);

  const handleDelete = async (id) => {
    await api.delete(`/coupon/delete-coupon/${id}`);
    toast.success("Coupon code deleted successfully!");
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupon/create-coupon-code", {
        name,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        selectedProduct,
        value,
        shopId: seller._id,
      });
      toast.success("Coupon code created successfully!");
      setOpen(false);
      setName("");
      setMinAmount("");
      setMaxAmount("");
      setSelectedProduct("");
      setValue("");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  if (loading) return null;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button onClick={() => setOpen(true)}>Create Coupon Code</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coupon Code</TableHead>
            <TableHead>Value</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.value}%</TableCell>
              <TableCell>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="size-[18px]" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {coupons.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted">
                No coupons yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {open && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-4">
          <Card variant="solid" className="w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-content">Create Coupon Code</h3>
              <button onClick={() => setOpen(false)}>
                <X className="size-5 text-muted" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="mb-1 block">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">
                  Discount Percentage <span className="text-red-500">*</span>
                </Label>
                <Input required type="number" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Min Amount</Label>
                <Input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Max Amount</Label>
                <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Selected Product</Label>
                <select
                  className="h-11 w-full rounded-DEFAULT border border-border bg-surface px-3 text-content outline-none focus:border-brand"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Choose a product</option>
                  {(products || []).map((i) => (
                    <option value={i.name} key={i._id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
