import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Plus,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Employee, LeaveRequest, WorkSchedule, WorkHour, User } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function HRManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("employees");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez vous connecter pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: employees = [] } = useQuery<(Employee & { user?: User })[]>({
    queryKey: ["/api/employees"],
  });

  const { data: leaveRequests = [] } = useQuery<(LeaveRequest & { employee?: Employee & { user?: User } })[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: workHours = [] } = useQuery<WorkHour[]>({
    queryKey: ["/api/work-hours"],
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => e.status === "active");
  const pendingRequests = leaveRequests.filter((r) => r.status === "pending");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyHours = workHours
    .filter((wh) => wh.month === currentMonth && wh.year === currentYear)
    .reduce((sum, wh) => sum + Number(wh.hoursWorked), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Ressources Humaines</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les employés, horaires et demandes de congé
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Employés Actifs
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {activeEmployees.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-md bg-chart-3/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Demandes en Attente
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {pendingRequests.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Heures ce Mois
                </p>
                <p className="text-2xl font-semibold mt-1">
                  {monthlyHours.toFixed(0)}h
                </p>
              </div>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Employés
                </p>
                <p className="text-2xl font-semibold mt-1">{employees.length}</p>
              </div>
              <div className="w-12 h-12 rounded-md bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion du Personnel</CardTitle>
              <CardDescription>
                Gérez les employés, horaires et demandes
              </CardDescription>
            </div>
            <AddEmployeeDialog />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="employees" data-testid="tab-employees">
                Employés
              </TabsTrigger>
              <TabsTrigger value="leave-requests" data-testid="tab-leave-requests">
                Demandes de Congé
              </TabsTrigger>
              <TabsTrigger value="work-hours" data-testid="tab-work-hours">
                Heures Travaillées
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              <EmployeesTable employees={employees} />
            </TabsContent>

            <TabsContent value="leave-requests">
              <LeaveRequestsTable requests={leaveRequests} />
            </TabsContent>

            <TabsContent value="work-hours">
              <WorkHoursTable workHours={workHours} employees={employees} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeesTable({
  employees,
}: {
  employees: (Employee & { user?: User })[];
}) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucun employé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Taux Horaire</TableHead>
            <TableHead>Date d'Embauche</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
              <TableCell className="font-medium">
                {employee.user?.firstName} {employee.user?.lastName}
              </TableCell>
              <TableCell>{employee.user?.email || "-"}</TableCell>
              <TableCell>{Number(employee.hourlyRate).toFixed(0)} FCFA/h</TableCell>
              <TableCell>
                {format(new Date(employee.hireDate), "d MMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.status === "active" ? "default" : "secondary"}
                >
                  {employee.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LeaveRequestsTable({
  requests,
}: {
  requests: (LeaveRequest & { employee?: Employee & { user?: User } })[];
}) {
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "approved" | "rejected";
    }) => {
      await apiRequest("PATCH", `/api/leave-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Demande mise à jour",
        description: "Le statut de la demande a été modifié.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la demande.",
        variant: "destructive",
      });
    },
  });

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucune demande de congé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Du</TableHead>
            <TableHead>Au</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
              <TableCell className="font-medium">
                {request.employee?.user?.firstName}{" "}
                {request.employee?.user?.lastName}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {request.requestType === "vacation"
                    ? "Congé"
                    : "Maladie"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(request.startDate), "d MMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                {format(new Date(request.endDate), "d MMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {request.reason || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                {request.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-primary"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: request.id,
                          status: "approved",
                        })
                      }
                      data-testid={`button-approve-${request.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: request.id,
                          status: "rejected",
                        })
                      }
                      data-testid={`button-reject-${request.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function WorkHoursTable({
  workHours,
  employees,
}: {
  workHours: WorkHour[];
  employees: (Employee & { user?: User })[];
}) {
  if (workHours.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucune heure enregistrée</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Heures</TableHead>
            <TableHead>Mois/Année</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workHours.slice(0, 50).map((wh) => {
            const employee = employees.find((e) => e.id === wh.employeeId);
            return (
              <TableRow key={wh.id} data-testid={`row-workhour-${wh.id}`}>
                <TableCell className="font-medium">
                  {employee?.user?.firstName} {employee?.user?.lastName}
                </TableCell>
                <TableCell>
                  {format(new Date(wh.workDate), "d MMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>{Number(wh.hoursWorked).toFixed(1)}h</TableCell>
                <TableCell>
                  {wh.month}/{wh.year}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AddEmployeeDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      hourlyRate: string;
      hireDate: string;
    }) => {
      await apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Employé ajouté",
        description: "L'employé a été ajouté avec succès.",
      });
      setOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'employé.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      userId: formData.get("userId") as string,
      hourlyRate: formData.get("hourlyRate") as string,
      hireDate: formData.get("hireDate") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="button-add-employee">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Employé
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un Employé</DialogTitle>
          <DialogDescription>
            Enregistrez un nouvel employé dans le système.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">ID Utilisateur</Label>
            <Input
              id="userId"
              name="userId"
              required
              placeholder="ex: 12345678"
              data-testid="input-employee-userid"
            />
            <p className="text-xs text-muted-foreground mt-1">
              L'utilisateur doit avoir créé un compte au préalable
            </p>
          </div>
          <div>
            <Label htmlFor="hourlyRate">Taux Horaire (FCFA)</Label>
            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              step="0.01"
              required
              data-testid="input-employee-rate"
            />
          </div>
          <div>
            <Label htmlFor="hireDate">Date d'Embauche</Label>
            <Input
              id="hireDate"
              name="hireDate"
              type="date"
              required
              data-testid="input-employee-hiredate"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-employee"
          >
            {mutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
