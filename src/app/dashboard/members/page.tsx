import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const members = [
  { id: "M001", name: "John Doe", plan: "Gold", status: "Active", expires: "2024-12-31" },
  { id: "M002", name: "Jane Smith", plan: "Silver", status: "Active", expires: "2024-11-30" },
  { id: "M003", name: "Mike Johnson", plan: "Bronze", status: "Overdue", expires: "2024-05-15" },
  { id: "M004", name: "Emily Davis", plan: "Gold", status: "Active", expires: "2025-01-20" },
  { id: "M005", name: "Chris Brown", plan: "Silver", status: "Active", expires: "2024-10-10" },
]

export default function MembersPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Members</CardTitle>
              <CardDescription>Manage your gym members and their subscription plans.</CardDescription>
            </div>
            <Button>Add Member</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <MemberTable data={members} />
          </TabsContent>
          <TabsContent value="active">
             <MemberTable data={members.filter(m => m.status === 'Active')} />
          </TabsContent>
          <TabsContent value="overdue">
             <MemberTable data={members.filter(m => m.status === 'Overdue')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MemberTable({ data }: { data: typeof members }) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead>
                <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.map((member) => (
                <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.plan}</TableCell>
                <TableCell>
                    <Badge variant={member.status === 'Active' ? 'secondary' : 'destructive'}>
                    {member.status}
                    </Badge>
                </TableCell>
                <TableCell>{member.expires}</TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Workouts</DropdownMenuItem>
                        <DropdownMenuItem>View Payments</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}
