"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CloudUpload, Paperclip, Loader } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";

// Removed Zod schema

export default function MyForm() {
  const [files, setFiles] = useState<File[] | null>(null); // Multiple files state
  const [isUploading, setIsUploading] = useState(false); // Add upload state

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      fileUpload: null as File | null, // Matches `nullable()` in schema
    },
  });

  async function uploadToLightsail(file: File) {
    try {
      console.log("Uploading file to Lightsail:", file.name);

      // Create form data for the file
      const formData = new FormData();
      formData.append("file", file);

      // Send to our server-side API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data.url);
      return data.url; // Return the URL from the response

    } catch (error) {
      console.error("Lightsail upload error:", error);
      throw error;
    }
  }

  async function sendDataToAPI(values: any) {
    try {
      setIsUploading(true);

      if (!files || files.length === 0) {
        throw new Error("No file selected for upload.");
      }

      // Upload the file and get the file URL (data.url)
      const fileURL = await uploadToLightsail(files[0]);

      // Log the data (file URL) before sending it to the API
      console.log("Form data to be sent to API:", {
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        file: fileURL, // The file URL returned from uploadToLightsail
      });

      // Prepare form data to send to the API
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('file', fileURL); // Send the file URL

      // Send the form data to the API
      const BaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${BaseURL}/api/resume`, {
        method: "POST",
        body: formData,  // Send FormData directly
      });

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      toast.success("Form submitted successfully!");
      form.reset();
      setFiles(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmit(values: any) {
    try {
      console.log("Submitting form data:", values);
      sendDataToAPI(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10 w-full"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" type="text" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" type="email" {...field} />
              </FormControl>
              <FormDescription>
                This is your public email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={field.value}
                  onChange={field.onChange}
                  defaultCountry="TR"
                />
              </FormControl>
              <FormDescription>Enter your phone number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileUpload"
          render={() => (
            <FormItem>
              <FormLabel>Upload file</FormLabel>
              <FormControl>
                <FileUploader
                  value={files}
                  onValueChange={(uploadedFiles) => {
                    setFiles(uploadedFiles); // Update local state with multiple files
                    if (uploadedFiles && uploadedFiles.length > 0) {
                      form.setValue("fileUpload", uploadedFiles[0], {
                        shouldValidate: true,
                      }); // Update form state with the first file
                    }
                  }}
                  dropzoneOptions={{}} // Provide the required dropzoneOptions property
                  className="relative bg-background rounded-lg p-2"
                >
                  <FileInput className="outline-dashed outline-1 outline-slate-500">
                    <div className="flex items-center justify-center flex-col p-8 w-full">
                      <CloudUpload className="text-gray-500 w-10 h-10" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                        &nbsp; or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG, or GIF
                      </p>
                    </div>
                  </FileInput>
                  <FileUploaderContent>
                    {files && files.length > 0 && (
                      <FileUploaderItem index={0}>
                        <Paperclip className="h-4 w-4 stroke-current" />
                        <span>{files[0].name}</span>
                      </FileUploaderItem>
                    )}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormDescription>Select a file to upload.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
