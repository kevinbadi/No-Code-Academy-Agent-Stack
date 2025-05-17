import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScheduleConfig } from "@shared/schema";
import { COMMON_CRON_EXPRESSIONS } from "@shared/scheduler-schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Trash2, Play, Edit, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";

export default function SchedulerUI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleConfig | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cronExpression: "",
    webhookUrl: "",
    isActive: true
  });
  
  // Fetch existing schedules
  const {
    data: schedules,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["/api/schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules");
      if (!res.ok) {
        throw new Error(`Failed to fetch schedules: ${res.statusText}`);
      }
      return res.json() as Promise<ScheduleConfig[]>;
    }
  });
  
  // Create a new schedule
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error(`Failed to create schedule: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Created",
        description: "Your webhook schedule has been created successfully."
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Schedule",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Update an existing schedule
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error(`Failed to update schedule: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Updated",
        description: "Your webhook schedule has been updated successfully."
      });
      setIsOpen(false);
      setIsEditing(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Schedule",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Delete a schedule
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error(`Failed to delete schedule: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Deleted",
        description: "The webhook schedule has been deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Schedule",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Run a schedule manually
  const runMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/schedules/${id}/run`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error(`Failed to run webhook: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/linkedin-agent-leads/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Webhook Executed",
        description: data.message || "The webhook has been executed successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Execute Webhook",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  function resetForm() {
    setFormData({
      name: "",
      description: "",
      cronExpression: "",
      webhookUrl: "",
      isActive: true
    });
    setSelectedSchedule(null);
  }
  
  function openEditDialog(schedule: ScheduleConfig) {
    setSelectedSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description || "",
      cronExpression: schedule.cronExpression,
      webhookUrl: schedule.webhookUrl,
      isActive: schedule.isActive
    });
    setIsEditing(true);
    setIsOpen(true);
  }
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isEditing && selectedSchedule) {
      updateMutation.mutate({ id: selectedSchedule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }
  
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  function getCronDescription(expression: string): string {
    const found = COMMON_CRON_EXPRESSIONS.find(c => c.value === expression);
    return found ? found.label : "Custom schedule";
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Webhook Schedules</CardTitle>
          <CardDescription>
            Configure when the LinkedIn agent webhook should be automatically triggered
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                setIsEditing(false);
                resetForm();
              }}
            >
              <Plus size={16} />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
              <DialogDescription>
                Set up when you want the LinkedIn agent webhook to run automatically
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Daily LinkedIn Outreach"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Runs every day at 9 AM to send new invites"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    name="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="https://hook.make.com/..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cronExpression">Schedule</Label>
                  <Select 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cronExpression: value }))}
                    value={formData.cronExpression}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_CRON_EXPRESSIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-destructive">Error loading schedules: {error instanceof Error ? error.message : "Unknown error"}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/schedules"] })}
            >
              Try Again
            </Button>
          </div>
        ) : schedules && schedules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    <div>
                      {schedule.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {schedule.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getCronDescription(schedule.cronExpression)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {schedule.cronExpression}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={schedule.isActive ? 
                        "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700 dark:text-green-100" : 
                        ""
                      }
                      variant={schedule.isActive ? undefined : "secondary"}
                    >
                      {schedule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {schedule.lastRun ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDateTime(new Date(schedule.lastRun))}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never run</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Run now"
                        onClick={() => runMutation.mutate(schedule.id)}
                        disabled={runMutation.isPending}
                      >
                        {runMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Edit"
                        onClick={() => openEditDialog(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the webhook schedule "{schedule.name}".
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(schedule.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No scheduled webhooks configured yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add Schedule" to create your first automated webhook schedule.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}