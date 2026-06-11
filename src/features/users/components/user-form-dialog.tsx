import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRoles, useCreateUser } from "@/features/users/hooks/use-users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  roleIds: z.array(z.number()).min(1, "Please select at least one role"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  onSuccess?: () => void;
}

export function UserFormDialog({ onSuccess }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      phone: "",
      roleIds: [],
    },
  });

  const selectedRoleIds = watch("roleIds");

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setValue("roleIds", [...selectedRoleIds, roleId], {
        shouldValidate: true,
      });
    } else {
      setValue(
        "roleIds",
        selectedRoleIds.filter((id) => id !== roleId),
        { shouldValidate: true },
      );
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      await createUserMutation.mutateAsync({
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
        roleIds: values.roleIds,
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 px-3 uppercase font-semibold tracking-wide text-white"
        >
          <Plus className="h-4 w-4 text-white" />
          <span className="text-white">Add User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Administrator / Staff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md py-4">
          <div className="space-y-xs">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="e.g. john_doe"
            />
            {errors.username && (
              <p className="text-caption text-error">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-xs">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="e.g. john@hospital.org"
            />
            {errors.email && (
              <p className="text-caption text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-xs">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="e.g. John Doe"
            />
            {errors.fullName && (
              <p className="text-caption text-error">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-xs">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="e.g. +256700000000"
            />
            {errors.phone && (
              <p className="text-caption text-error">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-xs">
            <Label>Staff System Roles</Label>
            {loadingRoles ? (
              <div className="flex items-center gap-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin text-mute" />
                <span className="text-caption text-mute">
                  Loading system roles...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-sm pt-2">
                {roles?.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoleIds.includes(role.id)}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleRoleChange(role.id, !!checked)
                      }
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-body-sm font-medium leading-none cursor-pointer"
                    >
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {errors.roleIds && (
              <p className="text-caption text-error">
                {errors.roleIds.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-lg"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Register Staff Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
