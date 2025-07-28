"use client"; // Enables client-side interactivity in Next.js

import { z } from "zod"; // Schema validation
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; // For showing toast notifications
import { auth } from "@/firebase/client"; // Firebase client instance
import { useForm } from "react-hook-form"; // For form state management
import { useRouter } from "next/navigation"; // For client-side navigation
import { zodResolver } from "@hookform/resolvers/zod"; // Integrates Zod with react-hook-form

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"; // Firebase auth methods

import { Form } from "@/components/ui/form"; // Custom UI form component
import { Button } from "@/components/ui/button"; // Custom UI button component

import { signIn, signUp } from "@/lib/actions/auth.action"; // Server-side auth actions
import FormField from "./FormField"; // Custom form field wrapper

// Schema definition for both sign-in and sign-up forms
const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Validates form with Zod
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handles form submission for both sign-in and sign-up
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        // Firebase creates a new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Also register the user on your backend
        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in"); // Redirect to sign-in
      } else {
        const { email, password } = data;

        // Firebase signs in the user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        // Call backend to persist session
        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/"); // Redirect to dashboard/home
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        {/* Logo + App Name */}
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">MockMate</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        {/* Auth Form UI */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {/* Name field only for Sign Up */}
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            {/* Submit Button */}
            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        {/* Switch between Sign In and Sign Up */}
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
