"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { uploadFileToLightsail } from "@/lib/aws";

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
import { CloudUpload, Paperclip } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";

const formSchema = z.object({
  name_5631324324: z.string().min(1),
  name_9232977966: z.string().min(1),
  name_4780170454: z.string(),
  name_2598142521: z.instanceof(File).optional(),
});



async function ApiRequest(values: z.infer<typeof formSchema>) {
  try {
    console.log("Submitting data:", values);

    // Define API endpoints
    const apiEndpoints = [
      "https://api.example.com/submit1",
      "https://api.example.com/submit2",
      "https://api.example.com/submit3"
    ];

    // Create an array of POST requests
    const requests = apiEndpoints.map((endpoint) =>
      axios.post(endpoint, values)
    );

    // Send all requests concurrently
    await Promise.all(requests);

    toast.success("Form submitted successfully to all APIs!");

  } catch (error) {
    console.error("Form submission error", error);
    toast.error("Failed to submit the form. Please try again.");
  }
}



export default function MyForm() {
  const [file, setFile] = useState<File | null>(null);

  const dropZoneConfig = {
    maxFiles: 1, // Allow only one file
    maxSize: 1024 * 1024 * 4,
    multiple: false, // Prevent multiple file selection
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_5631324324: "", // Ensure default string values
      name_9232977966: "",
      name_4780170454: "",
      name_2598142521: undefined, // Optional file input
    },
  });

  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  // });

  async function submitToAPI(values: z.infer<typeof formSchema>) {
    try {
      let resumeURL = "";
  
      // If a file is selected, upload to Lightsail
      if (file) {
        resumeURL = await uploadFileToLightsail(file);
      }
  
      const formData = new FormData();
  
      // Append form values including resume URL
      Object.keys(values).forEach((key) => {
        if (key === "name_2598142521") {
          formData.append("resumeUrl", resumeURL); // Attach file URL instead of the file itself
        } else {
          const value = values[key as keyof typeof values];
          if (value !== undefined) {
            formData.append(key, value);
          }
        }
      });
  
      // Send form data to the Lambda function
      const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
      if (!lambdaUrl) {
        throw new Error("NEXT_PUBLIC_LAMBDA_URL is not defined");
      }
      const response = await fetch(lambdaUrl, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit the form.");
      }
  
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }
  
  

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitToAPI(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10 w-full">
        <FormField
          control={form.control}
          name="name_5631324324"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" type="text" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name_9232977966"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormDescription>Enter your email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name_4780170454"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Phone number</FormLabel>
              <FormControl className="w-full">
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
          name="name_2598142521"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <FileUploader
                  value={file ? [file] : []}
                  onValueChange={(newFiles) => {
                    const singleFile = newFiles ? newFiles[0] || null : null;
                    setFile(singleFile);
                    field.onChange(singleFile); // Update form state
                  }}
                  dropzoneOptions={dropZoneConfig}
                  className="relative bg-background rounded-lg p-2"
                >
                  <FileInput id="fileInput" className="outline-dashed outline-1 outline-slate-500">
                    <div className="flex items-center justify-center flex-col p-8 w-full">
                      <CloudUpload className="text-gray-500 w-10 h-10" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allowed formats: SVG, PNG, JPG, GIF
                      </p>
                    </div>
                  </FileInput>
                  <FileUploaderContent>
                    {file && (
                      <FileUploaderItem index={0}>
                        <Paperclip className="h-4 w-4 stroke-current" />
                        <span>{file.name}</span>
                      </FileUploaderItem>
                    )}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormDescription>Upload a single file.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
