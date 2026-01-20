import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MilestoneOut } from "@/types/api";
import { useCreateMilestone, useUpdateMilestone } from "@/hooks/use-projects";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

const milestoneFormSchema = z.object({
  name: z.string().min(1, { message: "Milestone name is required." }),
  due_date: z.date({ required_error: "Due date is required." }),
  status: z.enum(["pending", "in_progress", "completed", "delayed"], {
    required_error: "Status is required.",
  }),
  progress: z.coerce.number().min(0).max(100, { message: "Progress must be between 0 and 100." }),
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

interface MilestoneFormProps {
  projectId: number;
  initialData?: MilestoneOut;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MilestoneForm({ projectId, initialData, onSuccess, onCancel }: MilestoneFormProps) {
  const isEditing = !!initialData;
  const createMilestoneMutation = useCreateMilestone();
  const updateMilestoneMutation = useUpdateMilestone();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      status: initialData?.status || "pending",
      progress: initialData?.progress || 0,
    },
  });

  const onSubmit = async (values: MilestoneFormValues) => {
    try {
      if (isEditing && initialData?.id) {
        await updateMilestoneMutation.mutateAsync({
          milestoneId: initialData.id,
          data: {
            name: values.name,
            status: values.status,
            progress: values.progress,
            due_date: format(values.due_date, "yyyy-MM-dd"),
          } as any,
        });
        toast.success("Milestone updated successfully!");
      } else {
        await createMilestoneMutation.mutateAsync({
          projectId,
          data: {
            name: values.name,
            due_date: format(values.due_date, "yyyy-MM-dd"),
          } as any,
        });
        toast.success("Milestone created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(`Failed to save milestone: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Milestone Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter milestone name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter progress percentage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting || createMilestoneMutation.isPending || updateMilestoneMutation.isPending}>
            {isEditing ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Form>
  );
}