import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Props for a reusable form field component, generic over form data type T
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;                  // react-hook-form control object
  name: Path<T>;                        // field name (must be a valid path in T)
  label: string;                        // label for the input
  placeholder?: string;                 // optional placeholder
  type?: "text" | "email" | "password"; // input type (defaults to "text")
}

// Reusable form input field using react-hook-form Controller
const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {/* Label for the field */}
          <FormLabel className="label">{label}</FormLabel>

          {/* Input component bound to react-hook-form */}
          <FormControl>
            <Input
              className="input"
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>

          {/* Displays validation error messages */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
