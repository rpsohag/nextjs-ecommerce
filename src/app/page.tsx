import { ModeToggle } from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <div className="flex justify-between items-center p-10">
      <h1 className="font-inter">ShopNow</h1>
      <ModeToggle />
    </div>
  );
}
