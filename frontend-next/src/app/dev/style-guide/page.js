"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MoreHorizontal } from "lucide-react";

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-semibold text-content">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function StyleGuidePage() {
  const [select, setSelect] = useState("");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
      <div className="pointer-events-none fixed -top-40 -right-40 -z-10 size-96 rounded-full bg-brand/30 blur-3xl" />

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 800px:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-content">Design System</h1>
            <p className="text-muted">Every shared primitive, one place to restyle.</p>
          </div>
          <ThemeToggle />
        </div>

        <Section title="Buttons">
          <Button variant="solid">Solid</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button onClick={() => toast.success("It works!")}>Toast</Button>
        </Section>

        <Section title="Form fields">
          <Card className="w-full max-w-md p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Ada Lovelace" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Country</Label>
                <Select value={select} onValueChange={setSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pk">Pakistan</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Badges">
          <Badge variant="brand">Brand</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="glass">Glass</Badge>
        </Section>

        <Section title="Avatar & Skeleton">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/100" alt="user" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>PK</AvatarFallback>
          </Avatar>
          <Skeleton className="h-10 w-40" />
          <Skeleton className="size-10 rounded-full" />
        </Section>

        <Section title="Cards">
          <Card variant="glass" className="w-64 p-0">
            <CardHeader>
              <CardTitle>Glass card</CardTitle>
              <CardDescription>Default glassmorphism surface.</CardDescription>
            </CardHeader>
            <CardContent>Frosted, translucent, blurred.</CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          <Card variant="solid" className="w-64 p-0">
            <CardHeader>
              <CardTitle>Solid card</CardTitle>
              <CardDescription>Opaque surface variant.</CardDescription>
            </CardHeader>
            <CardContent>Used where legibility matters most.</CardContent>
          </Card>
        </Section>

        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="glass">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>This is a Radix dialog skinned by the ui/dialog primitive.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="one" className="w-full">
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
            <TabsContent value="one">Tab one content.</TabsContent>
            <TabsContent value="two">Tab two content.</TabsContent>
            <TabsContent value="three">Tab three content.</TabsContent>
          </Tabs>
        </Section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-content">Table</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>#1023</TableCell>
                <TableCell>Ada Lovelace</TableCell>
                <TableCell>
                  <Badge variant="success">Delivered</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>#1024</TableCell>
                <TableCell>Grace Hopper</TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        <Separator />
        <p className="pb-10 text-center text-sm text-muted">
          Change <code>--radius</code> or <code>--glass-*</code> in globals.css — everything above updates at once.
        </p>
      </div>
    </div>
  );
}
