"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

// import { uploadFileToLightsail } from "@/lib/aws"; // Import the working function






const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  fileUpload: z
    .array(z.string().url("Invalid URL format"))
    .min(1, "At least one file URL is required"),
});


export default function MyForm() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Add upload state

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      fileUpload: [],
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
      return data.url;

    } catch (error) {
      console.error("Lightsail upload error:", error);
      throw error;
    }
  }


  async function sendDataToAPI(values: z.infer<typeof formSchema>) {
    console.log("Sending data to API", values);
    try {
      setIsUploading(true);
  
      if (!files || files.length === 0) {
        toast.error("Please select at least one file to upload");
        return;
      }
  
      // Upload files
      const fileURLs: string[] = [];
      for (const file of files) {
        try {
          const url = await uploadToLightsail(file);
          fileURLs.push(url);
          console.log("Uploaded file:", url);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
  
      if (fileURLs.length === 0) {
        toast.error("No files were uploaded successfully");
        return;
      }
  
      const payload = {
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        files: fileURLs, // Match the schema field name
      };
  
      console.log("Sending JSON data to API", payload);
  
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

        console.log("Response frosssm API:", response);

      if (!response.ok) {

        throw new Error(`Failed to submit form: ${response.status} ${response.statusText}`);

      }
  
      const data = await response.json();
      toast.success("Form submitted successfully!",data);
      form.reset();
      setFiles(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    } finally {
      setIsUploading(false);
    }
  }
  

  function onSubmit(values: z.infer<typeof formSchema>) {
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
                      setFiles(uploadedFiles); // Update local state
                      if (uploadedFiles) {
                        const fileUrls = uploadedFiles.map(file => URL.createObjectURL(file));
                        form.setValue("fileUpload", fileUrls, {
                          shouldValidate: true,
                        }); // Update form state
                      }
                    }}
                    dropzoneOptions={dropZoneConfig}
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
                    {files?.map((file, i) => (
                      <FileUploaderItem key={i} index={i}>
                        <Paperclip className="h-4 w-4 stroke-current" />
                        <span>{file.name}</span>
                      </FileUploaderItem>
                    ))}
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