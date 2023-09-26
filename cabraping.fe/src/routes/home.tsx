import { ButtonLink } from "@/components/ui/button-link";

export default function Home() {
  return (
    <div className="py-48 flex justify-center items-center">
      <ButtonLink to="/dashboard">42 Login</ButtonLink>
    </div>
  );
}
