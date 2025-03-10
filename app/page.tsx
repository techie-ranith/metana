// import Image from "next/image";
// import Form from "@/components/forms/cv_upload_form";
import Image from "next/image";
import Metana from "@/public/logo.png";
import TestForm from "@/components/forms/test_form";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen py-10">
      <Image src={Metana} alt="Metana Logo" />
      {/* <Form></Form> */}
      <TestForm></TestForm>
      <div className="w-full h-screen relative">
    </div>
    </div>
  );
}