import { ModeToggle } from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex justify-between items-center p-10">
      <h1 className="font-inter">ShopNow</h1>
      <div>
        <UserButton/>
      <ModeToggle />
      </div>
    </div>
  );
}
