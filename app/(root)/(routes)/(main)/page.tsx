import Image from "next/image";
import SearchForm from "../(search)/search/components/search-form";

import logoSingle from "@/assets/logo_single.png";

// const SearchForm = dynamic(() => import("./search/components/search-form"), {
//   ssr: false,
// });

export default function LandingPage() {
  return (
    <div className="h-full flex justify-center min-h-[calc(100svh-8.5rem)]">
      <div className="w-full max-w-[52rem] my-20 mx-auto">
        <div className="flex justify-center mb-10">
          <Image src={logoSingle} alt="logo" width={200} />
        </div>
        <div className="max-w-[52rem] mx-auto">
          <SearchForm />
        </div>
      </div>
    </div>
  );
}
