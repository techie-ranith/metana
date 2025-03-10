"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { uploadFileToLightsail } from "@/lib/aws";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CloudUpload, Paperclip, Loader } from "lucide-react";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/components/ui/extension/file-upload";

const formSchema = z.object({
  username: z.string().min(1),
  email: z.string().min(1),
  phoneNumber: z.string(),
  fileUpload: z.instanceof(File).optional(),
});

export default function MyForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // Added loading state

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: false,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      // fileUpload: undefined,
    },
  });

  async function submitToAPI(values: z.infer<typeof formSchema>) {
    try {
      console.log("Starting submitToAPI with values:", values);
      setLoading(true); // Set loading to true
  
      let resumeURL = "";
      if (file) {
        console.log("Uploading file:", file.name);
        // Assuming uploadFileToLightsail is a working function
        resumeURL = await uploadFileToLightsail(file);
        console.log("File uploaded, resumeURL:", resumeURL);
      }
  
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values]) {
          formData.append(key, values[key as keyof typeof values] as string);
          console.log(`FormData appended: ${key} = ${values[key as keyof typeof values]}`);
        }
      });
  
      // If a file is uploaded, append the file URL to the formData
      if (file) {
        formData.append("resumeUrl", resumeURL);
        console.log("FormData appended: resumeUrl =", resumeURL);
      }
  
      const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;
      if (!lambdaUrl) {
        throw new Error("NEXT_PUBLIC_LAMBDA_URL is not defined");
      }
      console.log("Sending FormData to:", lambdaUrl);
  
      const response = await fetch(lambdaUrl, {
        method: "POST",
        body: formData,
      });
  
      console.log("Fetch response:", response);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch failed, response text:", errorText);
        throw new Error(`Failed to submit form: ${response.status} - ${response.statusText}`);
      }
  
      console.log("Form submitted successfully!");
      toast.success("Form submitted successfully!");
      form.reset();
      setFile(null); // Reset file input after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  }
  

  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   console.log("onSubmit triggered with values:", values);
  //   submitToAPI(values);
  // }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitToAPI)} className="space-y-8 max-w-3xl mx-auto py-10 w-full">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
              </FormControl>
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
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="fileUpload"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <FileUploader
                  value={file ? [file] : []}
                  onValueChange={(newFiles) => {
                    const singleFile = newFiles ? newFiles[0] || null : null;
                    setFile(singleFile);
                    field.onChange(singleFile);
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
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button type="submit" disabled={loading} className="flex items-center justify-center">
          {loading ? (
            <>
              <Loader className="animate-spin w-4 h-4 mr-2" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}